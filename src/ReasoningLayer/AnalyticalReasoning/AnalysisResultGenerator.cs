using CognitiveMesh.ReasoningLayer.AnalyticalReasoning.Models;
using CognitiveMesh.Shared.Interfaces;

namespace CognitiveMesh.ReasoningLayer.AnalyticalReasoning;

/// <summary>
/// Generates analytical results by invoking the configured LLM route
/// with structured prompts for data-driven analysis.
/// </summary>
public class AnalysisResultGenerator
{
    private readonly ILLMClient _llmClient;

    /// <summary>
    /// Initializes a new instance of the <see cref="AnalysisResultGenerator"/> class.
    /// </summary>
    /// <param name="llmClient">The LLM client for generating completions.</param>
    public AnalysisResultGenerator(ILLMClient llmClient)
    {
        _llmClient = llmClient ?? throw new ArgumentNullException(nameof(llmClient));
    }

    /// <summary>
    /// Generates an analytical result for the specified data query.
    /// </summary>
    public async Task<AnalyticalResult> GenerateAnalysisResultAsync(string dataQuery)
    {
        var systemPrompt = "You are an analytical system that performs data-driven analysis based on the provided query. " +
                           "Generate a detailed analysis report.";

        var completion = await _llmClient.GenerateChatCompletionAsync(
            [
                new ChatMessage("system", systemPrompt),
                new ChatMessage("user", $"Data Query: {dataQuery}")
            ],
            0.3f,
            800);

        return new AnalyticalResult
        {
            Query = dataQuery,
            AnalysisReport = completion
        };
    }
}
