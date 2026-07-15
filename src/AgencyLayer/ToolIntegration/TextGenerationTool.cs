using Microsoft.Extensions.Logging;
using CognitiveMesh.Shared.Interfaces;

namespace AgencyLayer.ToolIntegration
{
    /// <summary>
    /// A tool that generates text using the configured LLM route.
    /// </summary>
    public class TextGenerationTool : BaseTool
    {
        private readonly ILLMClient _llmClient;

        /// <inheritdoc />
        public override string Name => "Text Generation Tool";

        /// <inheritdoc />
        public override string Description => "Generates text based on the provided prompt using the configured LLM route.";

        /// <summary>
        /// Initializes a new instance of the <see cref="TextGenerationTool"/> class.
        /// </summary>
        /// <param name="llmClient">The LLM client used for completions.</param>
        /// <param name="logger">The logger instance.</param>
        public TextGenerationTool(ILLMClient llmClient, ILogger<TextGenerationTool> logger)
            : base(logger)
        {
            _llmClient = llmClient ?? throw new ArgumentNullException(nameof(llmClient));
        }

        /// <summary>
        /// Executes the text generation tool with the specified parameters.
        /// </summary>
        /// <param name="parameters">
        /// A dictionary that must contain a <c>"prompt"</c> key with a string value.
        /// </param>
        /// <returns>The generated text.</returns>
        /// <exception cref="Exception">
        /// Thrown when the <c>"prompt"</c> parameter is missing, not a string,
        /// or when the underlying API call fails.
        /// </exception>
        public override async Task<string> ExecuteAsync(Dictionary<string, object> parameters)
        {
            if (!parameters.TryGetValue("prompt", out var promptObj) || promptObj is not string prompt)
            {
                throw new Exception("Missing or invalid 'prompt' parameter");
            }

            try
            {
                var messages = new List<ChatMessage>
                {
                    new("user", prompt)
                };

                var result = await _llmClient.GenerateChatCompletionAsync(messages);

                _logger.LogInformation("Text generation executed successfully for prompt: {Prompt}", prompt);

                return result;
            }
            catch (Exception ex) when (ex is not Exception { Message: "Missing or invalid 'prompt' parameter" })
            {
                _logger.LogError(ex, "Error executing text generation for prompt: {Prompt}", prompt);
                throw;
            }
        }
    }
}
