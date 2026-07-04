# AGENTS.md - Guidance for AI Coding Agents in Cognitive Mesh

This file bridges Antigravity (Gemini), Claude Code, and other AI agents into the Cognitive Mesh project. It is automatically loaded by the Antigravity CLI.

## Startup Protocol

On session start, you **MUST** read and conform to:
1. [CLAUDE.md](file:///C:/Users/smitj/repos/cognitive-mesh/CLAUDE.md) - For the repository overview, hexagonal architecture rules, key patterns, build/test commands, and conventions.

## Architecture and Execution Rules

- **Hexagonal Architecture**: Keep layers decoupled (Foundation ← Reasoning ← Metacognitive ← Agency ← Business). Always define ports as interfaces (`I{Concept}Port`), implement via adapters (`{Implementation}Adapter`), and keep business logic in engines (`{Concept}Engine`).
- **Build Warnings**: All warnings are treated as errors (`TreatWarningsAsErrors=true`). Do not commit code that generates C# warnings.
- **Verification**: Always run `dotnet build` and `dotnet test` locally to verify changes before pushing. Double-check your git diffs to ensure no stray modifications.
