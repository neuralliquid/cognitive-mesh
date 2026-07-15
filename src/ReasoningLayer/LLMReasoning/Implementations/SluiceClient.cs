using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using CognitiveMesh.ReasoningLayer.LLMReasoning.Abstractions;
using Microsoft.Extensions.Logging;
using SharedChatMessage = CognitiveMesh.Shared.Interfaces.ChatMessage;

namespace CognitiveMesh.ReasoningLayer.LLMReasoning.Implementations
{
    /// <summary>
    /// Routes Cognitive Mesh language-model operations through Sluice.
    /// </summary>
    public sealed class SluiceClient : ILLMClient, CognitiveMesh.Shared.Interfaces.ILLMClient
    {
        private readonly string _baseUrl;
        private readonly string _apiKey;
        private readonly ILogger<SluiceClient>? _logger;
        private readonly JsonSerializerOptions _jsonOptions;
        private HttpClient? _httpClient;
        private bool _disposed;

        /// <summary>
        /// Initializes a new instance of the <see cref="SluiceClient"/> class.
        /// </summary>
        /// <param name="baseUrl">The Sluice API base URL.</param>
        /// <param name="apiKey">Optional Sluice bearer token or API key.</param>
        /// <param name="modelName">The logical model or route name Sluice should resolve.</param>
        /// <param name="maxTokens">Maximum output tokens allowed by this client.</param>
        /// <param name="logger">Optional logger instance.</param>
        public SluiceClient(
            string baseUrl,
            string apiKey = "",
            string modelName = "default",
            int maxTokens = 16_384,
            ILogger<SluiceClient>? logger = null)
        {
            if (string.IsNullOrWhiteSpace(baseUrl))
                throw new ArgumentException("Sluice base URL is required.", nameof(baseUrl));

            _baseUrl = baseUrl.TrimEnd('/');
            _apiKey = apiKey ?? string.Empty;
            ModelName = string.IsNullOrWhiteSpace(modelName) ? "default" : modelName;
            MaxTokens = maxTokens > 0 ? maxTokens : 16_384;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
                WriteIndented = false
            };
        }

        /// <inheritdoc/>
        public string ModelName { get; }

        /// <inheritdoc/>
        public int MaxTokens { get; }

        /// <inheritdoc/>
        public Task InitializeAsync(CancellationToken cancellationToken = default)
        {
            if (_httpClient != null)
                return Task.CompletedTask;

            _httpClient = new HttpClient
            {
                BaseAddress = new Uri(_baseUrl),
                Timeout = TimeSpan.FromSeconds(120)
            };
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            if (!string.IsNullOrWhiteSpace(_apiKey))
            {
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            }

            _logger?.LogInformation("Sluice client initialized for model route {ModelName} at {BaseUrl}", ModelName, _baseUrl);
            return Task.CompletedTask;
        }

        /// <inheritdoc/>
        public async Task<string> GenerateCompletionAsync(
            string prompt,
            float temperature = 0.7f,
            int maxTokens = 1000,
            CancellationToken cancellationToken = default)
        {
            return await GenerateChatCompletionAsync(
                new[] { new SharedChatMessage("user", prompt) },
                temperature,
                maxTokens,
                cancellationToken);
        }

        /// <inheritdoc/>
        public async Task<string> GenerateCompletionAsync(
            string prompt,
            int maxTokens = 1000,
            float temperature = 0.7f,
            IEnumerable<string>? stopSequences = null,
            CancellationToken cancellationToken = default)
        {
            return await SendCompletionAsync(
                new[] { new SharedChatMessage("user", prompt) },
                temperature,
                maxTokens,
                stopSequences,
                cancellationToken);
        }

        /// <inheritdoc/>
        public async Task<string> GenerateChatCompletionAsync(
            IEnumerable<SharedChatMessage> messages,
            float temperature = 0.7f,
            int maxTokens = 1000,
            CancellationToken cancellationToken = default)
        {
            return await SendCompletionAsync(messages, temperature, maxTokens, null, cancellationToken);
        }

        /// <summary>
        /// Generates a chat completion from reasoning-layer chat messages.
        /// </summary>
        /// <param name="messages">The chat messages to send.</param>
        /// <param name="temperature">The sampling temperature to use.</param>
        /// <param name="maxTokens">The maximum number of tokens to generate.</param>
        /// <param name="cancellationToken">Cancellation token for async operations.</param>
        /// <returns>The generated completion.</returns>
        public async Task<string> GenerateChatCompletionAsync(
            IEnumerable<ChatMessage> messages,
            float temperature = 0.7f,
            int maxTokens = 1000,
            CancellationToken cancellationToken = default)
        {
            var sharedMessages = messages.Select(m => new SharedChatMessage(m.Role, m.Content));
            return await SendCompletionAsync(sharedMessages, temperature, maxTokens, null, cancellationToken);
        }

        /// <inheritdoc/>
        public async Task<float[]> GetEmbeddingsAsync(string text, CancellationToken cancellationToken = default)
        {
            var results = await GetBatchEmbeddingsAsync(new[] { text }, cancellationToken);
            return results.FirstOrDefault() ?? [];
        }

        /// <inheritdoc/>
        public async Task<float[][]> GetBatchEmbeddingsAsync(IEnumerable<string> texts, CancellationToken cancellationToken = default)
        {
            if (texts == null || !texts.Any())
                throw new ArgumentException("Texts cannot be null or empty.", nameof(texts));

            await EnsureInitializedAsync(cancellationToken);

            var requestBody = new
            {
                model = ModelName,
                input = texts.ToArray()
            };

            using var content = CreateJsonContent(requestBody);
            var responseBody = await PostJsonAsync("/v1/embeddings", content, cancellationToken);
            return ParseEmbeddings(responseBody);
        }

        /// <inheritdoc/>
        public Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken = default)
            => GetEmbeddingsAsync(text, cancellationToken);

        /// <inheritdoc/>
        public async Task<IEnumerable<string>> GenerateMultipleCompletionsAsync(
            string prompt,
            int numCompletions = 3,
            int maxTokens = 500,
            float temperature = 0.8f,
            CancellationToken cancellationToken = default)
        {
            var results = new List<string>(numCompletions);
            for (var i = 0; i < numCompletions; i++)
            {
                results.Add(await GenerateCompletionAsync(prompt, maxTokens, temperature, cancellationToken: cancellationToken));
            }

            return results;
        }

        /// <inheritdoc/>
        public int GetTokenCount(string text)
        {
            if (string.IsNullOrEmpty(text))
                return 0;

            return (int)Math.Ceiling(text.Length / 4.0);
        }

        /// <inheritdoc/>
        public IChatSession StartChat(string? systemMessage = null)
        {
            return new SluiceChatSession(this, systemMessage);
        }

        /// <inheritdoc/>
        public void Dispose()
        {
            if (_disposed)
                return;

            _httpClient?.Dispose();
            _disposed = true;
        }

        private async Task<string> SendCompletionAsync(
            IEnumerable<SharedChatMessage> messages,
            float temperature,
            int maxTokens,
            IEnumerable<string>? stopSequences,
            CancellationToken cancellationToken)
        {
            if (messages == null || !messages.Any())
                throw new ArgumentException("Messages cannot be null or empty.", nameof(messages));

            await EnsureInitializedAsync(cancellationToken);

            var requestBody = new
            {
                model = ModelName,
                messages = messages.Select(m => new { role = m.Role.ToLowerInvariant(), content = m.Content }),
                temperature = Math.Clamp(temperature, 0f, 2f),
                max_tokens = Math.Min(maxTokens, MaxTokens),
                stop = stopSequences?.ToArray(),
                stream = false
            };

            using var content = CreateJsonContent(requestBody);
            var responseBody = await PostJsonAsync("/v1/chat/completions", content, cancellationToken);
            return ParseCompletion(responseBody);
        }

        private StringContent CreateJsonContent(object value)
        {
            var json = JsonSerializer.Serialize(value, _jsonOptions);
            return new StringContent(json, Encoding.UTF8, "application/json");
        }

        private async Task<string> PostJsonAsync(string path, HttpContent content, CancellationToken cancellationToken)
        {
            try
            {
                var response = await _httpClient!.PostAsync(path, content, cancellationToken);
                var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
                if (!response.IsSuccessStatusCode)
                {
                    throw new InvalidOperationException(
                        $"Sluice request failed with status {(int)response.StatusCode}: {responseBody}");
                }

                return responseBody;
            }
            catch (HttpRequestException ex)
            {
                throw new InvalidOperationException("Failed to communicate with Sluice.", ex);
            }
        }

        private static string ParseCompletion(string responseBody)
        {
            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement;

            if (root.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
            {
                var firstChoice = choices[0];
                if (firstChoice.TryGetProperty("message", out var message) &&
                    message.TryGetProperty("content", out var content))
                {
                    return content.GetString()?.Trim() ?? string.Empty;
                }

                if (firstChoice.TryGetProperty("text", out var text))
                {
                    return text.GetString()?.Trim() ?? string.Empty;
                }
            }

            if (root.TryGetProperty("content", out var rootContent))
                return rootContent.GetString()?.Trim() ?? string.Empty;

            if (root.TryGetProperty("text", out var rootText))
                return rootText.GetString()?.Trim() ?? string.Empty;

            return responseBody;
        }

        private static float[][] ParseEmbeddings(string responseBody)
        {
            using var doc = JsonDocument.Parse(responseBody);
            if (!doc.RootElement.TryGetProperty("data", out var data))
                return [];

            var embeddings = new List<float[]>();
            foreach (var item in data.EnumerateArray())
            {
                if (!item.TryGetProperty("embedding", out var embedding))
                    continue;

                embeddings.Add(embedding.EnumerateArray().Select(e => e.GetSingle()).ToArray());
            }

            return embeddings.ToArray();
        }

        private async Task EnsureInitializedAsync(CancellationToken cancellationToken)
        {
            if (_httpClient == null)
                await InitializeAsync(cancellationToken);
        }

        private sealed class SluiceChatSession : IChatSession
        {
            private readonly SluiceClient _owner;
            private readonly List<ChatMessage> _history = new();

            public SluiceChatSession(SluiceClient owner, string? systemMessage)
            {
                _owner = owner;
                if (!string.IsNullOrWhiteSpace(systemMessage))
                    _history.Add(new ChatMessage("system", systemMessage));
            }

            public IReadOnlyList<ChatMessage> History => _history.AsReadOnly();

            public async Task<string> SendMessageAsync(string message, CancellationToken cancellationToken = default)
            {
                _history.Add(new ChatMessage("user", message));
                var response = await _owner.GenerateChatCompletionAsync(_history, cancellationToken: cancellationToken);
                _history.Add(new ChatMessage("assistant", response));
                return response;
            }

            public void Dispose()
            {
            }
        }
    }
}
