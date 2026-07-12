using AgencyLayer.CognitiveSandwich.Infrastructure;
using CognitiveMesh.AgencyLayer.RealTime.Infrastructure;
using CognitiveMesh.BusinessApplications.AdaptiveBalance.Infrastructure;
using CognitiveMesh.BusinessApplications.ImpactMetrics.Infrastructure;
using CognitiveMesh.BusinessApplications.NISTCompliance.Infrastructure;

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
app.MapControllers();
app.MapCognitiveMeshHubs();

app.Run();
