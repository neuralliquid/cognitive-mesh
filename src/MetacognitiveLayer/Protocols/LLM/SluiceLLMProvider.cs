using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;

namespace MetacognitiveLayer.Protocols.LLM
{
    /// <summary>
    /// LLM provider that routes protocol-level completions and embeddings through Sluice.
    /// </summary>
    public sealed class SluiceLLMProvider : ILLMProvider, IDisposable
    {
        private readonly string _baseUrl;
        private readonly string _apiKey;
        private readonly string _defaultModel;
        private readonly ILogger<SluiceLLMProvider>? _logger;
        private readonly JsonSerializerOptions _jsonOptions;
        private readonly HttpClient _httpClient;
        private bool _disposed;

        /// <summary>
        /// Initializes a new instance of the <see cref="SluiceLLMProvider"/> class.
        /// </summary>
        /// <param name="baseUrl">The Sluice API base URL.</param>
        /// <param name="apiKey">Optional Sluice bearer token or API key.</param>
        /// <param name="defaultModel">The default Sluice model route.</param>
        /// <param name="logger">Optional logger instance.</param>
        public SluiceLLMProvider(
            string baseUrl,
            string apiKey = "",
            string defaultModel = "default",
            ILogger<SluiceLLMProvider>? logger = null)
        {
            if (string.IsNullOrWhiteSpace(baseUrl))
                throw new ArgumentException("Sluice base URL is required.", nameof(baseUrl));

            _baseUrl = baseUrl.TrimEnd('/');
            _apiKey = apiKey ?? string.Empty;
            _defaultModel = string.IsNullOrWhiteSpace(defaultModel) ? "default" : defaultModel;
            _logger = logger;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
                WriteIndented = false
            };
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri(_baseUrl),
                Timeout = TimeSpan.FromSeconds(120)
            };
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            if (!string.IsNullOrWhiteSpace(_apiKey))
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        }

        /// <inheritdoc/>
        public async Task<string> CompletePromptAsync(string prompt, LLMOptions? options = null)
        {
            options ??= new LLMOptions();
            _logger?.LogDebug("Routing protocol completion through Sluice model route {Model}", options.Model);

            var messages = string.IsNullOrWhiteSpace(options.SystemMessage)
                ? new[] { new { role = "user", content = prompt } }
                : new[]
                {
                    new { role = "system", content = options.SystemMessage },
                    new { role = "user", content = prompt }
                };

            var requestBody = new
            {
                model = string.IsNullOrWhiteSpace(options.Model) || options.Model == "default" ? _defaultModel : options.Model,
                messages,
                temperature = Math.Clamp(options.Temperature, 0f, 2f),
                max_tokens = options.MaxTokens,
                stream = false
            };

            using var content = CreateJsonContent(requestBody);
            var responseBody = await PostJsonAsync("/v1/chat/completions", content);
            return ParseCompletion(responseBody);
        }

        /// <inheritdoc/>
        public async Task<string> CreateEmbeddingAsync(string text)
        {
            var requestBody = new
            {
                model = _defaultModel,
                input = text
            };

            using var content = CreateJsonContent(requestBody);
            var responseBody = await PostJsonAsync("/v1/embeddings", content);
            return ParseEmbedding(responseBody);
        }

        /// <inheritdoc/>
        public void Dispose()
        {
            if (_disposed)
                return;

            _httpClient.Dispose();
            _disposed = true;
        }

        private StringContent CreateJsonContent(object value)
        {
            var json = JsonSerializer.Serialize(value, _jsonOptions);
            return new StringContent(json, Encoding.UTF8, "application/json");
        }

        private async Task<string> PostJsonAsync(string path, HttpContent content)
        {
            var response = await _httpClient.PostAsync(path, content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException(
                    $"Sluice request failed with status {(int)response.StatusCode}: {responseBody}");
            }

            return responseBody;
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
                    return text.GetString()?.Trim() ?? string.Empty;
            }

            if (root.TryGetProperty("content", out var rootContent))
                return rootContent.GetString()?.Trim() ?? string.Empty;

            if (root.TryGetProperty("text", out var rootText))
                return rootText.GetString()?.Trim() ?? string.Empty;

            return responseBody;
        }

        private static string ParseEmbedding(string responseBody)
        {
            using var doc = JsonDocument.Parse(responseBody);
            if (!doc.RootElement.TryGetProperty("data", out var data) || data.GetArrayLength() == 0)
                return "[]";

            if (!data[0].TryGetProperty("embedding", out var embedding))
                return "[]";

            var values = embedding.EnumerateArray().Select(e => e.GetSingle()).ToArray();
            return JsonSerializer.Serialize(values);
        }
    }
}
