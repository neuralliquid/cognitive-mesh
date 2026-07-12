using CognitiveMesh.ReasoningLayer.LLMReasoning.Abstractions;
using Microsoft.Extensions.Logging;

namespace CognitiveMesh.ReasoningLayer.LLMReasoning
{
    /// <summary>
    /// Factory class for creating ILLMClient instances.
    /// Routes production model calls through Sluice by default. Direct provider
    /// clients are retained only for explicit local mocks or migration shims.
    /// </summary>
    public static class LLMClientFactory
    {
        private const string DirectProviderOverrideKey = "ALLOW_DIRECT_MODEL_PROVIDER";

        /// <summary>
        /// Creates a new instance of <see cref="ILLMClient"/> using Sluice.
        /// </summary>
        /// <param name="baseUrl">The Sluice API base URL.</param>
        /// <param name="apiKey">Optional Sluice bearer token or API key.</param>
        /// <param name="modelName">The logical model or route name Sluice should resolve.</param>
        /// <param name="maxTokens">Maximum output tokens.</param>
        /// <param name="logger">Optional logger instance.</param>
        /// <returns>An initialized ILLMClient instance.</returns>
        public static async Task<ILLMClient> CreateSluiceClientAsync(
            string baseUrl,
            string apiKey = "",
            string modelName = "default",
            int maxTokens = 16_384,
            ILogger? logger = null)
        {
            var client = new Implementations.SluiceClient(
                baseUrl,
                apiKey,
                modelName,
                maxTokens,
                logger as ILogger<Implementations.SluiceClient>);

            await client.InitializeAsync();
            return client;
        }

        /// <summary>
        /// Creates a new instance of ILLMClient using Azure OpenAI
        /// </summary>
        /// <param name="apiKey">The Azure OpenAI API key</param>
        /// <param name="endpoint">The Azure OpenAI endpoint</param>
        /// <param name="deploymentName">The deployment name to use</param>
        /// <param name="modelName">Optional model name (default: "gpt-4")</param>
        /// <param name="maxTokens">Optional maximum tokens (default: 8192)</param>
        /// <param name="logger">Optional logger instance</param>
        /// <returns>An initialized ILLMClient instance</returns>
        public static async Task<ILLMClient> CreateAzureOpenAIClientAsync(
            string apiKey,
            string endpoint,
            string deploymentName,
            string modelName = "gpt-4",
            int maxTokens = 8192,
            ILogger? logger = null)
        {
            EnsureDirectProviderAllowed();

            if (string.IsNullOrWhiteSpace(apiKey))
                throw new ArgumentException("API key is required", nameof(apiKey));
            if (string.IsNullOrWhiteSpace(endpoint))
                throw new ArgumentException("Endpoint is required", nameof(endpoint));
            if (string.IsNullOrWhiteSpace(deploymentName))
                throw new ArgumentException("Deployment name is required", nameof(deploymentName));

            var client = new Implementations.OpenAIClient(
                apiKey,
                endpoint,
                deploymentName,
                modelName,
                maxTokens,
                logger as ILogger<Implementations.OpenAIClient>);

            await client.InitializeAsync();
            return client;
        }

        /// <summary>
        /// Creates a MiniMax client for MiniMax-M1 or MiniMax-M2.5 models.
        /// </summary>
        /// <param name="apiKey">MiniMax API key.</param>
        /// <param name="modelName">Model name (default: "MiniMax-M2.5").</param>
        /// <param name="maxTokens">Maximum output tokens (default: 32000).</param>
        /// <param name="endpoint">API endpoint (default: https://api.minimax.chat/v1).</param>
        /// <param name="logger">Optional logger instance.</param>
        /// <returns>An initialized ILLMClient instance.</returns>
        public static async Task<ILLMClient> CreateMiniMaxClientAsync(
            string apiKey,
            string modelName = "MiniMax-M2.5",
            int maxTokens = 32_000,
            string endpoint = "https://api.minimax.chat/v1",
            ILogger? logger = null)
        {
            EnsureDirectProviderAllowed();

            var client = new Implementations.MiniMaxClient(
                apiKey,
                modelName,
                maxTokens,
                endpoint,
                logger as ILogger<Implementations.MiniMaxClient>);

            await client.InitializeAsync();
            return client;
        }

        /// <summary>
        /// Creates a client for any OpenAI-compatible API endpoint (OpenAI, DeepSeek,
        /// Grok/xAI, Llama via Ollama, Anthropic via proxy, etc.).
        /// </summary>
        /// <param name="apiKey">API key (empty for local models).</param>
        /// <param name="endpoint">The API base URL.</param>
        /// <param name="modelName">The model identifier.</param>
        /// <param name="maxTokens">Maximum output tokens.</param>
        /// <param name="logger">Optional logger instance.</param>
        /// <returns>An initialized ILLMClient instance.</returns>
        public static async Task<ILLMClient> CreateOpenAICompatibleClientAsync(
            string apiKey,
            string endpoint,
            string modelName,
            int maxTokens = 16_384,
            ILogger? logger = null)
        {
            EnsureDirectProviderAllowed();

            var client = new Implementations.OpenAICompatibleClient(
                apiKey,
                endpoint,
                modelName,
                maxTokens,
                logger as ILogger<Implementations.OpenAICompatibleClient>);

            await client.InitializeAsync();
            return client;
        }

        /// <summary>
        /// Creates an ILLMClient by resolving the provider from the model key
        /// in the <see cref="LLMModelRegistry"/>. Supports all registered providers.
        /// </summary>
        /// <param name="modelKey">The model key from the registry (e.g., "claude-sonnet-4", "minimax-m2.5").</param>
        /// <param name="apiKey">The provider API key.</param>
        /// <param name="endpoint">Optional custom endpoint override.</param>
        /// <param name="deploymentName">Azure OpenAI deployment name (only for azure-openai provider).</param>
        /// <param name="logger">Optional logger instance.</param>
        /// <returns>An initialized ILLMClient instance.</returns>
        public static async Task<ILLMClient> CreateForModelAsync(
            string modelKey,
            string apiKey,
            string? endpoint = null,
            string? deploymentName = null,
            ILogger? logger = null)
        {
            EnsureDirectProviderAllowed();

            var model = LLMModelRegistry.GetAllModels()
                .FirstOrDefault(m => m.Key.Equals(modelKey, StringComparison.OrdinalIgnoreCase));

            if (model == null)
                throw new ArgumentException($"Unknown model key '{modelKey}'. Check LLMModelRegistry.", nameof(modelKey));

            var resolvedEndpoint = endpoint ?? model.DefaultEndpoint;

            return model.Provider.ToLower() switch
            {
                "azure-openai" => await CreateAzureOpenAIClientAsync(
                    apiKey,
                    resolvedEndpoint,
                    deploymentName ?? modelKey,
                    modelKey,
                    model.MaxOutputTokens,
                    logger),

                "minimax" => await CreateMiniMaxClientAsync(
                    apiKey,
                    model.DisplayName,
                    model.MaxOutputTokens,
                    resolvedEndpoint,
                    logger),

                // All other providers use the OpenAI-compatible client
                // (openai, google, deepseek, meta, xai, anthropic-via-proxy)
                _ => await CreateOpenAICompatibleClientAsync(
                    apiKey,
                    resolvedEndpoint,
                    modelKey,
                    model.MaxOutputTokens,
                    logger)
            };
        }

        /// <summary>
        /// Creates a new instance of ILLMClient using Azure OpenAI from configuration
        /// </summary>
        /// <param name="config">Configuration dictionary containing required parameters</param>
        /// <param name="logger">Optional logger instance</param>
        /// <returns>An initialized ILLMClient instance</returns>
        public static async Task<ILLMClient> CreateFromConfigAsync(
            IReadOnlyDictionary<string, string> config,
            ILogger? logger = null)
        {
            if (config == null)
                throw new ArgumentNullException(nameof(config));

            if (TryGetConfigValue(config, "SluiceBaseUrl", "SLUICE_BASE_URL", out var sluiceBaseUrl))
            {
                TryGetConfigValue(config, "SluiceApiKey", "SLUICE_API_KEY", out var sluiceApiKey);
                TryGetConfigValue(config, "SluiceModel", "SLUICE_MODEL", "ModelKey", out var sluiceModel);
                TryGetConfigValue(config, "MaxTokens", "SLUICE_MAX_TOKENS", out var sluiceMaxTokensValue);

                var sluiceMaxTokens = 16_384;
                if (!string.IsNullOrWhiteSpace(sluiceMaxTokensValue) &&
                    !int.TryParse(sluiceMaxTokensValue, out sluiceMaxTokens))
                {
                    logger?.LogWarning("Invalid Sluice max tokens value '{MaxTokens}', using default {DefaultMaxTokens}",
                        sluiceMaxTokensValue, sluiceMaxTokens);
                    sluiceMaxTokens = 16_384;
                }

                return await CreateSluiceClientAsync(
                    sluiceBaseUrl!,
                    sluiceApiKey ?? string.Empty,
                    string.IsNullOrWhiteSpace(sluiceModel) ? "default" : sluiceModel,
                    sluiceMaxTokens,
                    logger);
            }

            EnsureDirectProviderAllowed();

            // Check for new multi-provider config format
            if (config.TryGetValue("ModelKey", out var modelKey) && !string.IsNullOrWhiteSpace(modelKey))
            {
                if (!config.TryGetValue("ApiKey", out var key) || string.IsNullOrWhiteSpace(key))
                    throw new ArgumentException("ApiKey is required in configuration");

                config.TryGetValue("Endpoint", out var ep);
                config.TryGetValue("DeploymentName", out var dn);

                return await CreateForModelAsync(modelKey, key, ep, dn, logger);
            }

            // Legacy Azure OpenAI format
            if (!config.TryGetValue("ApiKey", out var apiKey) || string.IsNullOrWhiteSpace(apiKey))
                throw new ArgumentException("ApiKey is required in configuration");

            if (!config.TryGetValue("Endpoint", out var endpoint) || string.IsNullOrWhiteSpace(endpoint))
                throw new ArgumentException("Endpoint is required in configuration");

            if (!config.TryGetValue("DeploymentName", out var deploymentName) || string.IsNullOrWhiteSpace(deploymentName))
                throw new ArgumentException("DeploymentName is required in configuration");

            config.TryGetValue("ModelName", out var modelName);
            config.TryGetValue("MaxTokens", out var maxTokensStr);

            int maxTokens = 8192;
            if (!string.IsNullOrWhiteSpace(maxTokensStr) && !int.TryParse(maxTokensStr, out maxTokens))
            {
                logger?.LogWarning("Invalid MaxTokens value '{MaxTokens}', using default {DefaultMaxTokens}",
                    maxTokensStr, maxTokens);
                maxTokens = 8192;
            }

            return await CreateAzureOpenAIClientAsync(
                apiKey,
                endpoint,
                deploymentName,
                modelName ?? "gpt-4",
                maxTokens,
                logger);
        }

        private static void EnsureDirectProviderAllowed()
        {
            var overrideValue = Environment.GetEnvironmentVariable(DirectProviderOverrideKey);
            if (string.Equals(overrideValue, "true", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(overrideValue, "1", StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            throw new InvalidOperationException(
                "Direct model-provider clients are disabled. Configure SLUICE_BASE_URL, or set " +
                $"{DirectProviderOverrideKey}=true only for local mocks or an explicit migration shim.");
        }

        private static bool TryGetConfigValue(
            IReadOnlyDictionary<string, string> config,
            string key,
            string alternateKey,
            out string? value)
        {
            return TryGetConfigValue(config, key, alternateKey, null, out value);
        }

        private static bool TryGetConfigValue(
            IReadOnlyDictionary<string, string> config,
            string key,
            string alternateKey,
            string? thirdKey,
            out string? value)
        {
            if (config.TryGetValue(key, out value) && !string.IsNullOrWhiteSpace(value))
                return true;

            if (config.TryGetValue(alternateKey, out value) && !string.IsNullOrWhiteSpace(value))
                return true;

            if (thirdKey != null && config.TryGetValue(thirdKey, out value) && !string.IsNullOrWhiteSpace(value))
                return true;

            value = null;
            return false;
        }
    }
}
