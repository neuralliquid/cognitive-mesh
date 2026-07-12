# Cognitive Mesh NeuralLiquid Handoff

Last updated: 2026-07-12

## Current State

- Repository: `phoenixvc/cognitive-mesh`
- Branch: `dev`
- Latest pushed commit: `89ab306 feat: add mystira identity login`
- Prod Azure resource group: `nl-prod-cognitive-mesh-rg`
- Shared ACR: `myssharedacr.azurecr.io`
- API App Service: `cognitive-mesh-api-prod`
- Frontend App Service: `cognitive-mesh-frontend-prod`
- Frontend deploy run `29195268245` completed successfully through staging and production.
- API deploy run `29193880939` completed successfully through staging and production.

## First Task Before Org Migration

Route all Cognitive Mesh AI/model calls through Sluice before continuing the org migration.

Rationale:

- CogMesh should own cognition, workflows, governance, UI, and domain behavior.
- Sluice should own model routing, provider credentials, fallbacks, rate limits, cost controls, observability, and AI egress policy.
- CogMesh should not call Azure OpenAI, OpenAI, Anthropic, or other model providers directly except for temporary local mocks or explicit migration shims.

Initial implementation menu:

1. Add a Sluice client/adapter in CogMesh behind a stable port/interface.
2. Introduce deployment config such as `SLUICE_BASE_URL` and the chosen auth mechanism for CogMesh-to-Sluice calls.
3. Replace concrete direct model calls with the Sluice adapter.
4. Keep `enable_openai = false` for CogMesh prod infrastructure unless a deliberate exception is approved.
5. Remove or quarantine direct provider secrets from CogMesh deployment and docs once Sluice is wired.

Known direct-AI areas to inspect first:

- `src/MetacognitiveLayer/ContinuousLearning/LearningManager.cs`
- `src/MetacognitiveLayer/Protocols/Common/Orchestration/AgentOrchestrator.cs`
- `src/MetacognitiveLayer/Protocols/LLM`
- `src/FoundationLayer/LLM`
- `src/AgencyLayer/Orchestration/Ports/*LLM*`
- Terraform OpenAI module variables and any docs that imply direct provider ownership by CogMesh.

## Auth Status

- Login is now implemented through a dedicated Entra SPA app registration:
  - Display name: `Cognitive Mesh UI (prod)`
  - Client ID: `d8182e32-4dda-4fc9-83bf-b5d517bc9528`
  - Tenant ID: `9530cd32-9e33-47f0-9247-ed964730b580`
- Redirect URIs configured:
  - `https://cognitive-mesh-frontend-prod.azurewebsites.net/login`
  - `https://cognitive-mesh-frontend-prod-staging.azurewebsites.net/login`
  - `https://cognitivemesh.neuralliquid.ai/login`
  - `https://app.cognitivemesh.neuralliquid.ai/login`
  - `https://frontend.cognitivemesh.neuralliquid.ai/login`
  - `https://staging.cognitivemesh.neuralliquid.ai/login`
  - `http://localhost:3000/login`
- GitHub repo variables set:
  - `NEXT_PUBLIC_MYSTIRA_AUTH_CLIENT_ID`
  - `NEXT_PUBLIC_MYSTIRA_TENANT_ID`
- Terraform and frontend deploy workflow now persist those auth settings.

## Deployment Status

Verified after deploy/apply:

- Frontend health: `https://cognitive-mesh-frontend-prod.azurewebsites.net/api/health`
- API prod health: `https://cognitive-mesh-api-prod.azurewebsites.net/healthz`
- API staging health: `https://cognitive-mesh-api-prod-staging.azurewebsites.net/healthz`

## Org Migration Tasks After Sluice Routing

1. Decide final target org/repo names and update GitHub Actions OIDC federated credentials.
2. Recreate or transfer repo variables/secrets without exposing values.
3. Decide DNS ownership timing:
   - Keep `mystira-workspace` DNS as a temporary bridge if it currently owns the zones.
   - Move NeuralLiquid-owned DNS/deployment state into NeuralLiquid-owned infra before long-term production.
4. Bind custom domains and certificates for the chosen `*.cognitivemesh.neuralliquid.ai` hosts.
5. Run final frontend/API deploys from the target org after OIDC and secrets are confirmed.

