# AGENTS.md - Guidance for AI Coding Agents in Cognitive Mesh

This file bridges Codex, Claude Code, Gemini, and other AI agents into the Cognitive Mesh project.

## Startup Protocol

On session start, read and conform to:

1. `CLAUDE.md` for architecture, commands, conventions, and operational rules.
2. `docs/agents/mvp-launch-engineer.md` when the task concerns the bounded public MVP, demo workflow, launch gate, telemetry, or funding evidence.
3. The Baton migration plans when the task concerns transfer from PhoenixVC to NeuralLiquid.

Do not use machine-specific `file:///` paths in repository guidance.

## Specialist routing

- MVP implementation, deployment, demo workflow, launch evidence: repository-local MVP Launch Engineer.
- Repository transfer, reference classification, rollback, ownership, CI identity: Baton Migration Coordinator.
- Funding claims and public evidence: Baton Evidence and Claims Auditor.
- Model/cloud cost and forecasts: Baton FinOps and Runway Analyst.

## Architecture and Execution Rules

- **Hexagonal Architecture**: Keep layers decoupled (Foundation ← Reasoning ← Metacognitive ← Agency ← Business). Define ports as interfaces (`I{Concept}Port`), adapters as `{Implementation}Adapter`, and business logic in `{Concept}Engine` classes.
- **Build Warnings**: All warnings are treated as errors (`TreatWarningsAsErrors=true`). Do not commit code that generates C# warnings.
- **Verification**: Run `dotnet build` and `dotnet test` before claiming completion. Check `git diff` and actual command output.
- **Migration freeze**: During an active migration batch, do not introduce unrelated features, dependency upgrades, namespace changes, or architecture rewrites.
- **Evidence**: Separate implemented, experimental, planned, and blocked capabilities in documentation and handoffs.
