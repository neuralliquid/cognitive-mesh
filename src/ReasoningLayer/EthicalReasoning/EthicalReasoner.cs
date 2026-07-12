using CognitiveMesh.Shared.Interfaces;

namespace CognitiveMesh.ReasoningLayer.EthicalReasoning;

/// <summary>
/// Performs ethical reasoning analysis by evaluating actions and decisions
/// against ethical frameworks using LLM-powered assessment.
/// </summary>
public class EthicalReasoner
{
    private readonly ILLMClient _llmClient;
    private readonly ILogger<EthicalReasoner> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="EthicalReasoner"/> class.
    /// </summary>
    public EthicalReasoner(ILLMClient llmClient, ILogger<EthicalReasoner> logger)
    {
        _llmClient = llmClient ?? throw new ArgumentNullException(nameof(llmClient));
        _logger = logger;
    }

    /// <summary>
    /// Analyzes the ethical implications of the given input scenario.
    /// </summary>
    public async Task<string> ConsiderEthicalImplicationsAsync(string input)
    {
        try
        {
            var systemPrompt = "You are an ethical reasoner. Consider the ethical implications of the following scenario and provide a detailed analysis.";

            var messages = new List<ChatMessage>
            {
                new("system", systemPrompt),
                new("user", input)
            };

            return await _llmClient.GenerateChatCompletionAsync(messages, 0.3f, 800);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error considering ethical implications with input: {Input}", input);
            throw;
        }
    }
}
