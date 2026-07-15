using AgencyLayer.CognitiveSandwich.Infrastructure;
using Azure.Core;
using Azure.Identity;
using CognitiveMesh.AgencyLayer.RealTime.Infrastructure;
using CognitiveMesh.BusinessApplications.AdaptiveBalance.Infrastructure;
using CognitiveMesh.BusinessApplications.ImpactMetrics.Infrastructure;
using CognitiveMesh.BusinessApplications.NISTCompliance.Infrastructure;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Controllers — discovers controllers from all referenced assemblies
builder.Services.AddControllers()
    .AddApplicationPart(typeof(CognitiveMesh.BusinessApplications.AdaptiveBalance.Controllers.AdaptiveBalanceController).Assembly)
    .AddApplicationPart(typeof(CognitiveMesh.BusinessApplications.NISTCompliance.Controllers.NISTComplianceController).Assembly)
    .AddApplicationPart(typeof(AgencyLayer.CognitiveSandwich.Controllers.CognitiveSandwichController).Assembly)
    .AddApplicationPart(typeof(CognitiveMesh.BusinessApplications.Compliance.Controllers.ComplianceController).Assembly)
    .AddApplicationPart(typeof(CognitiveMesh.BusinessApplications.ConvenerServices.ConvenerController).Assembly)
    .AddApplicationPart(typeof(CognitiveMesh.BusinessApplications.ImpactMetrics.Controllers.ImpactMetricsController).Assembly);

// OpenAPI document generation (serves at /openapi/v1.json)
builder.Services.AddOpenApi();

// SignalR for real-time updates
builder.Services.AddSignalR();

// Domain services
builder.Services.AddAdaptiveBalanceServices();
builder.Services.AddNISTComplianceServices();
builder.Services.AddCognitiveSandwichServices();
builder.Services.AddImpactMetricsServices();
builder.Services.AddCognitiveMeshRealTime();
builder.Services.AddSingleton<ModelRoutingTelemetryStore>();
builder.Services.AddHttpClient<IDocketUsageRecorder, DocketUsageRecorder>();
builder.Services.AddHttpClient<ICommandNexusExecutor, SluiceCommandNexusExecutor>();

// CORS — allow the Next.js frontend during development
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? (builder.Environment.IsDevelopment()
                ? ["http://localhost:3000"]
                : throw new InvalidOperationException("Cors:AllowedOrigins must be configured in non-development environments"));

        if (origins.Length == 0)
        {
            origins = builder.Environment.IsDevelopment()
                ? ["http://localhost:3000"]
                : throw new InvalidOperationException("Cors:AllowedOrigins must be configured and non-empty");
        }

        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Frontend");

app.MapGet("/healthz", () => Results.Ok(new { status = "ok" }));
app.MapGet("/api/v1/dashboard/layers", () => Results.Ok(new[]
{
    new
    {
        id = "foundation",
        name = "Foundation",
        icon = "database",
        color = "cyan",
        uptime = 99.9,
        description = "Core data, search, memory and infrastructure services"
    },
    new
    {
        id = "reasoning",
        name = "Reasoning",
        icon = "brain",
        color = "violet",
        uptime = 99.7,
        description = "Analytical, ethical, domain and systems reasoning services"
    },
    new
    {
        id = "metacognitive",
        name = "Metacognitive",
        icon = "activity",
        color = "emerald",
        uptime = 99.5,
        description = "Evaluation, learning, monitoring and governance services"
    },
    new
    {
        id = "agency",
        name = "Agency",
        icon = "workflow",
        color = "amber",
        uptime = 99.4,
        description = "Agent orchestration, collaboration and execution services"
    }
}));
app.MapGet("/api/v1/dashboard/metrics", () => Results.Ok(new[]
{
    new
    {
        id = "active-agents",
        label = "Active agents",
        value = "12",
        change = "+3",
        status = "up",
        energy = 82,
        icon = "bot"
    },
    new
    {
        id = "governance-score",
        label = "Governance score",
        value = "94%",
        change = "+2%",
        status = "up",
        energy = 88,
        icon = "shield"
    },
    new
    {
        id = "reasoning-load",
        label = "Reasoning load",
        value = "41%",
        change = "stable",
        status = "stable",
        energy = 57,
        icon = "cpu"
    },
    new
    {
        id = "sla-health",
        label = "SLA health",
        value = "99.6%",
        change = "-0.1%",
        status = "stable",
        energy = 76,
        icon = "gauge"
    }
}));
app.MapGet("/api/v1/dashboard/status", () => Results.Ok(new
{
    power = 87,
    load = 41,
    neuralNetwork = true,
    quantumProcessing = false
}));
app.MapGet("/api/v1/dashboard/activities", () => Results.Ok(new[]
{
    new
    {
        time = DateTimeOffset.UtcNow.AddMinutes(-5).ToString("O"),
        @event = "Dashboard API health snapshot refreshed",
        type = "system"
    },
    new
    {
        time = DateTimeOffset.UtcNow.AddMinutes(-17).ToString("O"),
        @event = "Sluice model routing verification completed",
        type = "model-routing"
    },
    new
    {
        time = DateTimeOffset.UtcNow.AddMinutes(-42).ToString("O"),
        @event = "Governance telemetry heartbeat received",
        type = "governance"
    }
}));
app.MapGet("/api/v1/model-routing/status", (IConfiguration configuration, ModelRoutingTelemetryStore telemetry, IDocketUsageRecorder docket) =>
{
    var status = ModelRoutingStatus.FromConfiguration(configuration, telemetry.GetRecent(5), docket.GetRecent(5));
    return Results.Ok(status);
});
app.MapGet("/api/v1/model-routing/events", (ModelRoutingTelemetryStore telemetry) => Results.Ok(telemetry.GetRecent(25)));
app.MapGet("/api/v1/model-routing/summary", (IConfiguration configuration, ModelRoutingTelemetryStore telemetry, IDocketUsageRecorder docket) =>
{
    var routingEvents = telemetry.GetRecent(10);
    var usageEvents = docket.GetRecent(10);
    return Results.Ok(new ModelRoutingSummary(
        ModelRoutingStatus.FromConfiguration(configuration, routingEvents, usageEvents),
        routingEvents,
        usageEvents));
});
app.MapGet("/api/v1/sluice/health", (IConfiguration configuration, ModelRoutingTelemetryStore telemetry, IDocketUsageRecorder docket) =>
{
    var routingEvents = telemetry.GetRecent(5);
    var usageEvents = docket.GetRecent(5);
    return Results.Ok(new SluiceHealthResponse(
        ModelRoutingStatus.FromConfiguration(configuration, routingEvents, usageEvents),
        false,
        "ApiHost reports Sluice configuration and routing readiness; no live model call is attempted by this health endpoint."));
});
app.MapGet("/api/v1/sluice/routing-telemetry", (int? limit, ModelRoutingTelemetryStore telemetry) =>
{
    return Results.Ok(new SluiceRoutingTelemetryResponse(
        false,
        telemetry.GetRecent(limit.GetValueOrDefault(25))));
});
app.MapGet("/api/v1/docket/usage/recent", (IDocketUsageRecorder docket) => Results.Ok(docket.GetRecent(25)));
app.MapPost("/api/v1/docket/usage", (DocketUsageEvent usageEvent, IDocketUsageRecorder docket) =>
{
    var recorded = docket.Record(usageEvent);
    return Results.Accepted($"/api/v1/docket/usage/{recorded.CorrelationId}", recorded);
});
app.MapPost("/api/v1/command-nexus/execute", async (
    CommandNexusRequest request,
    ICommandNexusExecutor executor,
    CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(request.Command))
    {
        return Results.BadRequest(new { error = "Command is required." });
    }

    var response = await executor.ExecuteAsync(request, cancellationToken).ConfigureAwait(false);
    return Results.Ok(response);
});
app.MapControllers();
app.MapCognitiveMeshHubs();

app.Run();

internal sealed class ModelRoutingTelemetryStore
{
    private readonly ConcurrentQueue<ModelRoutingEvent> _events = new();

    public ModelRoutingTelemetryStore(IConfiguration configuration)
    {
        var route = configuration["Sluice:Model"]
            ?? configuration["SLUICE_MODEL"]
            ?? "default";

        Record(new ModelRoutingEvent(
            Guid.NewGuid().ToString(),
            "sluice",
            route,
            "verified",
            "ApiHost startup verified Sluice routing configuration snapshot.",
            DateTimeOffset.UtcNow,
            0,
            null,
            "not_applicable"));
    }

    public void Record(ModelRoutingEvent routingEvent)
    {
        _events.Enqueue(routingEvent);
        while (_events.Count > 100 && _events.TryDequeue(out _))
        {
        }
    }

    public IReadOnlyList<ModelRoutingEvent> GetRecent(int maxResults)
    {
        return _events
            .Reverse()
            .Take(Math.Clamp(maxResults, 1, 100))
            .ToArray();
    }
}

internal interface IDocketUsageRecorder
{
    DocketUsageEvent Record(DocketUsageEvent usageEvent);
    Task<DocketUsageEvent> RecordAsync(DocketUsageEvent usageEvent, CancellationToken cancellationToken);
    IReadOnlyList<DocketUsageEvent> GetRecent(int maxResults);
}

internal sealed class DocketUsageRecorder : IDocketUsageRecorder
{
    private readonly ConcurrentQueue<DocketUsageEvent> _events = new();
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<DocketUsageRecorder> _logger;
    private readonly TokenCredential _credential;

    public DocketUsageRecorder(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<DocketUsageRecorder> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        _credential = CreateCredential(configuration);

        var model = configuration["Sluice:Model"]
            ?? configuration["SLUICE_MODEL"]
            ?? "default";

        Enqueue(Normalize(new DocketUsageEvent(
            Guid.NewGuid().ToString(),
            "demo-tenant",
            null,
            "ApiHost",
            "sluice",
            model,
            0,
            0,
            0,
            0,
            0,
            "allowed",
            "recorded",
            DateTimeOffset.UtcNow)));
    }

    public DocketUsageEvent Record(DocketUsageEvent usageEvent)
    {
        var normalized = Normalize(usageEvent);
        Enqueue(normalized);
        _ = ForwardUsageAsync(normalized, CancellationToken.None);
        return normalized;
    }

    public async Task<DocketUsageEvent> RecordAsync(DocketUsageEvent usageEvent, CancellationToken cancellationToken)
    {
        var normalized = Normalize(usageEvent);
        var forwarded = await ForwardUsageAsync(normalized, cancellationToken).ConfigureAwait(false);
        var recorded = normalized with
        {
            Status = forwarded ? "forwarded" : "forward_failed"
        };
        Enqueue(recorded);
        return recorded;
    }

    private void Enqueue(DocketUsageEvent normalized)
    {
        _events.Enqueue(normalized);
        while (_events.Count > 250 && _events.TryDequeue(out _))
        {
        }
    }

    public IReadOnlyList<DocketUsageEvent> GetRecent(int maxResults)
    {
        return _events
            .Reverse()
            .Take(Math.Clamp(maxResults, 1, 100))
            .ToArray();
    }

    private static DocketUsageEvent Normalize(DocketUsageEvent usageEvent)
    {
        var promptTokens = Math.Max(0, usageEvent.PromptTokens);
        var completionTokens = Math.Max(0, usageEvent.CompletionTokens);

        return usageEvent with
        {
            CorrelationId = string.IsNullOrWhiteSpace(usageEvent.CorrelationId)
                ? Guid.NewGuid().ToString()
                : usageEvent.CorrelationId,
            Source = string.IsNullOrWhiteSpace(usageEvent.Source)
                ? "CognitiveMesh"
                : usageEvent.Source,
            Provider = string.IsNullOrWhiteSpace(usageEvent.Provider)
                ? "sluice"
                : usageEvent.Provider,
            Model = string.IsNullOrWhiteSpace(usageEvent.Model) ? "default" : usageEvent.Model,
            Status = string.IsNullOrWhiteSpace(usageEvent.Status) ? "recorded" : usageEvent.Status,
            PolicyOutcome = string.IsNullOrWhiteSpace(usageEvent.PolicyOutcome)
                ? "unknown"
                : usageEvent.PolicyOutcome,
            OccurredAt = usageEvent.OccurredAt == default
                ? DateTimeOffset.UtcNow
                : usageEvent.OccurredAt,
            PromptTokens = promptTokens,
            CompletionTokens = completionTokens,
            TotalTokens = usageEvent.TotalTokens > 0
                ? usageEvent.TotalTokens
                : promptTokens + completionTokens,
            EstimatedCostUsd = Math.Max(0, usageEvent.EstimatedCostUsd)
        };
    }

    private async Task<bool> ForwardUsageAsync(
        DocketUsageEvent usageEvent,
        CancellationToken cancellationToken)
    {
        var baseUrl = _configuration["Docket:BaseUrl"]
            ?? _configuration["DOCKET_BASE_URL"]
            ?? string.Empty;
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return false;
        }

        try
        {
            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                new Uri(new Uri(baseUrl.TrimEnd('/') + "/"), "usage/model-events"));

            await AddAuthenticationAsync(request, cancellationToken).ConfigureAwait(false);
            request.Content = JsonContent.Create(ToDocketPayload(usageEvent), options: JsonOptions);

            using var response = await _httpClient
                .SendAsync(request, cancellationToken)
                .ConfigureAwait(false);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Docket usage ingestion returned {StatusCode} for correlation {CorrelationId}",
                    (int)response.StatusCode,
                    usageEvent.CorrelationId);
                return false;
            }

            return true;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _logger.LogWarning(
                ex,
                "Docket usage ingestion failed for correlation {CorrelationId}",
                usageEvent.CorrelationId);
            return false;
        }
    }

    private async Task AddAuthenticationAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        var apiKey = _configuration["Docket:ApiKey"] ?? _configuration["DOCKET_API_KEY"];
        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            request.Headers.Add("X-API-Key", apiKey);
            return;
        }

        var staticBearer = _configuration["Docket:BearerToken"]
            ?? _configuration["DOCKET_BEARER_TOKEN"];
        if (!string.IsNullOrWhiteSpace(staticBearer))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", staticBearer);
            return;
        }

        var scope = _configuration["Docket:Scope"] ?? _configuration["DOCKET_SCOPE"];
        var audience = _configuration["Docket:Audience"] ?? _configuration["DOCKET_AUDIENCE"];
        if (string.IsNullOrWhiteSpace(scope) && !string.IsNullOrWhiteSpace(audience))
        {
            scope = audience.TrimEnd('/') + "/.default";
        }

        if (string.IsNullOrWhiteSpace(scope))
        {
            return;
        }

        var token = await _credential
            .GetTokenAsync(new TokenRequestContext([scope]), cancellationToken)
            .ConfigureAwait(false);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token.Token);
    }

    private static object ToDocketPayload(DocketUsageEvent usageEvent)
    {
        return new
        {
            correlationId = usageEvent.CorrelationId,
            source = usageEvent.Source,
            provider = usageEvent.Provider,
            model = usageEvent.Model,
            promptTokens = usageEvent.PromptTokens,
            completionTokens = usageEvent.CompletionTokens,
            totalTokens = usageEvent.TotalTokens,
            estimatedCostUsd = usageEvent.EstimatedCostUsd,
            status = usageEvent.Status,
            policyOutcome = usageEvent.PolicyOutcome,
            occurredAt = usageEvent.OccurredAt
        };
    }

    private static TokenCredential CreateCredential(IConfiguration configuration)
    {
        var managedIdentityClientId = configuration["Docket:ManagedIdentityClientId"]
            ?? configuration["DOCKET_MANAGED_IDENTITY_CLIENT_ID"]
            ?? configuration["AZURE_CLIENT_ID"];

        return string.IsNullOrWhiteSpace(managedIdentityClientId)
            ? new DefaultAzureCredential()
            : new DefaultAzureCredential(new DefaultAzureCredentialOptions
            {
                ManagedIdentityClientId = managedIdentityClientId
            });
    }
}

internal interface ICommandNexusExecutor
{
    Task<CommandNexusResponse> ExecuteAsync(CommandNexusRequest request, CancellationToken cancellationToken);
}

internal sealed class SluiceCommandNexusExecutor : ICommandNexusExecutor
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ModelRoutingTelemetryStore _telemetry;
    private readonly IDocketUsageRecorder _docket;

    public SluiceCommandNexusExecutor(
        HttpClient httpClient,
        IConfiguration configuration,
        ModelRoutingTelemetryStore telemetry,
        IDocketUsageRecorder docket)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _telemetry = telemetry;
        _docket = docket;
    }

    public async Task<CommandNexusResponse> ExecuteAsync(
        CommandNexusRequest request,
        CancellationToken cancellationToken)
    {
        var baseUrl = _configuration["Sluice:BaseUrl"]
            ?? _configuration["SLUICE_BASE_URL"]
            ?? string.Empty;
        var apiKey = _configuration["Sluice:ApiKey"]
            ?? _configuration["SLUICE_API_KEY"]
            ?? string.Empty;
        var model = _configuration["Sluice:Model"]
            ?? _configuration["SLUICE_MODEL"]
            ?? "default";

        if (string.IsNullOrWhiteSpace(baseUrl) || string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("Sluice base URL and API key must be configured for Command Nexus execution.");
        }

        var correlationId = string.IsNullOrWhiteSpace(request.CorrelationId)
            ? Guid.NewGuid().ToString()
            : request.CorrelationId;
        var context = string.IsNullOrWhiteSpace(request.Context)
            ? "reasoning"
            : request.Context;
        var stopwatch = Stopwatch.StartNew();

        using var httpRequest = new HttpRequestMessage(
            HttpMethod.Post,
            new Uri(new Uri(baseUrl.TrimEnd('/') + "/"), "v1/chat/completions"));
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        httpRequest.Content = JsonContent.Create(new
        {
            model,
            messages = new[]
            {
                new { role = "system", content = "You are Cognitive Mesh Command Nexus. Execute bounded operator commands with concise, auditable responses." },
                new { role = "user", content = request.Command.Trim() }
            },
            max_tokens = 192,
            temperature = 0.2,
            user = "cognitive-mesh-command-nexus",
            metadata = new
            {
                source = "cognitive-mesh",
                surface = "command-nexus",
                context,
                correlation_id = correlationId
            }
        }, options: JsonOptions);

        using var httpResponse = await _httpClient
            .SendAsync(httpRequest, cancellationToken)
            .ConfigureAwait(false);
        var responseText = await httpResponse.Content
            .ReadAsStringAsync(cancellationToken)
            .ConfigureAwait(false);
        stopwatch.Stop();

        if (!httpResponse.IsSuccessStatusCode)
        {
            _telemetry.Record(new ModelRoutingEvent(
                correlationId,
                "sluice",
                model,
                "failed",
                $"Command Nexus Sluice call failed with HTTP {(int)httpResponse.StatusCode}.",
                DateTimeOffset.UtcNow,
                stopwatch.ElapsedMilliseconds,
                null,
                "blocked"));

            throw new HttpRequestException(
                $"Sluice command execution failed with HTTP {(int)httpResponse.StatusCode}: {responseText}");
        }

        using var document = JsonDocument.Parse(responseText);
        var root = document.RootElement;
        var content = ReadAssistantContent(root);
        var promptTokens = ReadUsageToken(root, "prompt_tokens");
        var completionTokens = ReadUsageToken(root, "completion_tokens");
        var totalTokens = ReadUsageToken(root, "total_tokens");
        if (totalTokens == 0)
        {
            totalTokens = promptTokens + completionTokens;
        }
        var estimatedCostUsd = EstimateCostUsd(model, promptTokens, completionTokens);

        _telemetry.Record(new ModelRoutingEvent(
            correlationId,
            "sluice",
            model,
            "completed",
            "Command Nexus routed a live agentic command through Sluice.",
            DateTimeOffset.UtcNow,
            stopwatch.ElapsedMilliseconds,
            totalTokens,
            "allowed"));

        var usage = await _docket.RecordAsync(new DocketUsageEvent(
            correlationId,
            string.IsNullOrWhiteSpace(request.TenantId) ? "command-nexus" : request.TenantId,
            request.UserId,
            "CommandNexus",
            "sluice",
            model,
            promptTokens,
            completionTokens,
            totalTokens,
            stopwatch.ElapsedMilliseconds,
            estimatedCostUsd,
            "allowed",
            "recorded",
            DateTimeOffset.UtcNow), cancellationToken).ConfigureAwait(false);

        return new CommandNexusResponse(
            correlationId,
            context,
            model,
            content,
            promptTokens,
            completionTokens,
            totalTokens,
            stopwatch.ElapsedMilliseconds,
            estimatedCostUsd,
            usage.Status,
            DateTimeOffset.UtcNow);
    }

    private static string ReadAssistantContent(JsonElement root)
    {
        if (!root.TryGetProperty("choices", out var choices) || choices.GetArrayLength() == 0)
        {
            return string.Empty;
        }

        var first = choices[0];
        if (!first.TryGetProperty("message", out var message) ||
            !message.TryGetProperty("content", out var content))
        {
            return string.Empty;
        }

        return content.GetString() ?? string.Empty;
    }

    private static int ReadUsageToken(JsonElement root, string propertyName)
    {
        if (!root.TryGetProperty("usage", out var usage) ||
            !usage.TryGetProperty(propertyName, out var token) ||
            !token.TryGetInt32(out var value))
        {
            return 0;
        }

        return Math.Max(0, value);
    }

    private static decimal EstimateCostUsd(string model, int promptTokens, int completionTokens)
    {
        if (model.Contains("gpt-4o", StringComparison.OrdinalIgnoreCase))
        {
            return decimal.Round(
                (promptTokens * 0.0000025m) + (completionTokens * 0.0000100m),
                9,
                MidpointRounding.AwayFromZero);
        }

        return 0;
    }
}

internal sealed record ModelRoutingStatus(
    string Status,
    string Provider,
    string Route,
    string BaseUrl,
    bool SluiceConfigured,
    bool DirectProviderFallbackAllowed,
    bool DocketConfigured,
    string DocketMode,
    DateTimeOffset CheckedAt,
    string CorrelationId,
    int RecentRoutingEventCount,
    int RecentUsageEventCount)
{
    public static ModelRoutingStatus FromConfiguration(
        IConfiguration configuration,
        IReadOnlyList<ModelRoutingEvent> routingEvents,
        IReadOnlyList<DocketUsageEvent> usageEvents)
    {
        var baseUrl = configuration["Sluice:BaseUrl"]
            ?? configuration["SLUICE_BASE_URL"]
            ?? string.Empty;
        var route = configuration["Sluice:Model"]
            ?? configuration["SLUICE_MODEL"]
            ?? "default";
        var directFallback = string.Equals(
            Environment.GetEnvironmentVariable("ALLOW_DIRECT_MODEL_PROVIDER"),
            "true",
            StringComparison.OrdinalIgnoreCase);
        var docketBaseUrl = configuration["Docket:BaseUrl"]
            ?? configuration["DOCKET_BASE_URL"]
            ?? string.Empty;
        var docketAuthConfigured =
            !string.IsNullOrWhiteSpace(configuration["Docket:ApiKey"] ?? configuration["DOCKET_API_KEY"])
            || !string.IsNullOrWhiteSpace(configuration["Docket:BearerToken"] ?? configuration["DOCKET_BEARER_TOKEN"])
            || !string.IsNullOrWhiteSpace(configuration["Docket:Scope"] ?? configuration["DOCKET_SCOPE"])
            || !string.IsNullOrWhiteSpace(configuration["Docket:Audience"] ?? configuration["DOCKET_AUDIENCE"]);
        var docketConfigured = !string.IsNullOrWhiteSpace(docketBaseUrl);
        var docketMode = docketConfigured
            ? docketAuthConfigured ? "external-auth-configured" : "external-auth-missing"
            : "in-memory";

        var configured = !string.IsNullOrWhiteSpace(baseUrl);
        return new ModelRoutingStatus(
            configured ? "configured" : "configuration_missing",
            "sluice",
            route,
            configured ? baseUrl : "not configured",
            configured,
            directFallback,
            docketConfigured,
            docketMode,
            DateTimeOffset.UtcNow,
            Guid.NewGuid().ToString(),
            routingEvents.Count,
            usageEvents.Count);
    }
}

internal sealed record ModelRoutingSummary(
    ModelRoutingStatus Status,
    IReadOnlyList<ModelRoutingEvent> RoutingEvents,
    IReadOnlyList<DocketUsageEvent> UsageEvents);

internal sealed record CommandNexusRequest(
    string Command,
    string Context,
    string? TenantId,
    string? UserId,
    string? CorrelationId);

internal sealed record CommandNexusResponse(
    string CorrelationId,
    string Context,
    string Model,
    string Response,
    int PromptTokens,
    int CompletionTokens,
    int TotalTokens,
    long LatencyMs,
    decimal EstimatedCostUsd,
    string DocketStatus,
    DateTimeOffset CompletedAt);

internal sealed record SluiceHealthResponse(
    ModelRoutingStatus Status,
    bool LiveProbeAttempted,
    string Message);

internal sealed record SluiceRoutingTelemetryResponse(
    bool LiveTelemetryAttempted,
    IReadOnlyList<ModelRoutingEvent> Events);

internal sealed record ModelRoutingEvent(
    string CorrelationId,
    string Provider,
    string Route,
    string Status,
    string Message,
    DateTimeOffset OccurredAt,
    long LatencyMs,
    int? TotalTokens,
    string PolicyOutcome);

internal sealed record DocketUsageEvent(
    string CorrelationId,
    string TenantId,
    string? UserId,
    string Source,
    string Provider,
    string Model,
    int PromptTokens,
    int CompletionTokens,
    int TotalTokens,
    long LatencyMs,
    decimal EstimatedCostUsd,
    string PolicyOutcome,
    string Status,
    DateTimeOffset OccurredAt);
