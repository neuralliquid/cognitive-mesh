# Cognitive Mesh NeuralLiquid Handoff

Last updated: 2026-07-14

## Current State

- Repository: `neuralliquid/cognitive-mesh`
- Branch: `dev`
- Transfer completed: 2026-07-14
- Previous repository path: `phoenixvc/cognitive-mesh` redirects to `neuralliquid/cognitive-mesh`
- Latest deployed/frontend merge commit verified this session: `5b76bf34389b0a82dcc546c2eb09d0494cb09e1e`
- Latest deployed API/frontend integration commit from Sluice/Docket work: `6e1e8fc991f73bee2e6a8fe017fa8b917cfaad87`
- Prod Azure resource group: `nl-prod-cognitive-mesh-rg`
- Shared ACR: `myssharedacr.azurecr.io`
- API App Service: `cognitive-mesh-api-prod`
- Frontend App Service: `cognitive-mesh-frontend-prod`
- API image verified after integration deploy: `myssharedacr.azurecr.io/cognitive-mesh-api:sha-6e1e8fc`
- Frontend image verified after widget-library deploy: `myssharedacr.azurecr.io/cognitive-mesh-frontend:sha-5b76bf3`
- API deploy run `29208727764` completed successfully.
- Frontend deploy run `29208730754` completed successfully for Sluice/Docket and IA work.
- Frontend deploy run `29211117975` completed successfully for the widget-library fix.

## Session Summary

Merged and deployed Cognitive Mesh Control/Command Center follow-up work:

- PR #506: Adaptive Balance live Control widget.
- PR #507: NIST/Compliance live widget.
- PR #508: Impact Metrics live widget.
- PR #509: Convener endpoint wiring.
- PR #510: Sluice health/routing telemetry, Docket usage-event adapter, Model Routing & Cost Control widget, and Command Center IA cleanup.
- PR #511: fixed Command Center Widget Library so widgets can be placed, moved, removed, and persisted in browser layout state.

Production checks completed:

- `https://api.cognitivemesh.neuralliquid.ai/api/v1/model-routing/summary` returned `200`.
- `https://api.cognitivemesh.neuralliquid.ai/api/v1/sluice/health` returned `200`.
- `https://api.cognitivemesh.neuralliquid.ai/api/v1/docket/usage/recent` returned `200`.
- `https://cognitive-mesh.neuralliquid.ai/control` returned protected-route redirect to `/login?returnTo=%2Fcontrol`.
- `https://cognitive-mesh-frontend-prod.azurewebsites.net/control` returned protected-route redirect to `/login?returnTo=%2Fcontrol`.
- `https://cognitive-mesh-frontend-prod.azurewebsites.net/api/health` returned healthy after frontend deploy.

Verification run locally before PRs:

- `dotnet build src/ApiHost/ApiHost.csproj`
- focused frontend ESLint for changed Control/dashboard/navigation/widget files
- `pnpm --dir src/UILayer/web exec tsc --noEmit`
- `pnpm --dir src/UILayer/web run build`

Known non-blocking warnings:

- Style Dictionary reports existing token collisions.
- Next config still contains deprecated/unsupported `eslint` config.
- Next reports the `middleware` file convention should move to `proxy`.

## First Task Before Org Migration

Route all Cognitive Mesh AI/model calls through Sluice before continuing the org migration. The first production-facing Sluice/Docket status contracts are now live, but real external Sluice/Docket connectivity still needs configuration and auth.

Rationale:

- CogMesh should own cognition, workflows, governance, UI, and domain behavior.
- Sluice should own model routing, provider credentials, fallbacks, rate limits, cost controls, observability, and AI egress policy.
- CogMesh should not call Azure OpenAI, OpenAI, Anthropic, or other model providers directly except for temporary local mocks or explicit migration shims.

Initial implementation menu:

1. Configure `SLUICE_BASE_URL` and chosen CogMesh-to-Sluice auth in production.
2. Configure `DOCKET_BASE_URL` and chosen CogMesh-to-Docket auth in production.
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
  - `https://cognitive-mesh.neuralliquid.ai/login`
  - `https://control.cognitive-mesh.neuralliquid.ai/login`
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

Additional notes:

- `control.cognitive-mesh.neuralliquid.ai` is bound on the frontend App Service, but `curl` to `https://control.cognitive-mesh.neuralliquid.ai/control` timed out from the CLI environment after the latest deploy. The same route worked on the main host and Azure default host, and the workflow production health check passed. Follow up with browser check plus DNS/custom-domain/proxy inspection if the subdomain still hangs.
- The Control/Command Center page is protected by login and reachable at `/control`.
- Control is intentionally removed from normal sidebar navigation and exposed through the Command Center launcher/dashboard entry.

## Command Center Status

Delivered:

- Fullscreen Command Center title and return-to-mesh button.
- Normal sidebar no longer treats Control as a peer dashboard page.
- Command Center launcher added near the signed-in user area.
- Widget Library now supports choosing a destination panel and adding/moving/removing widgets.
- Layout state persists in browser `localStorage`.
- Live widgets currently include Adaptive Balance and Model Routing & Cost.

Still planned:

- Server-backed user layout persistence.
- Replace remaining preview widgets with live modules.
- Decide whether `control.cognitive-mesh.neuralliquid.ai` should route directly to `/control` instead of requiring `/control`.
- Improve mobile layout of the Command Center after the core desktop interaction stabilizes.

## Sluice/Docket Status

Delivered:

- `GET /api/v1/model-routing/status`
- `GET /api/v1/model-routing/events`
- `GET /api/v1/model-routing/summary`
- `GET /api/v1/sluice/health`
- `GET /api/v1/sluice/routing-telemetry`
- `GET /api/v1/docket/usage/recent`
- `POST /api/v1/docket/usage`
- Control widget reads `/api/v1/model-routing/summary`.

Current production behavior:

- Sluice reports `configured` in production and staging when checked through CogMesh.
- Azure metadata confirms the Sluice LiteLLM gateway custom domain is `https://litellm.sluice.phoenixvc.tech`; CogMesh production and staging App Service settings now use `SLUICE_BASE_URL` plus a resolved Key Vault reference for `SLUICE_API_KEY`.
- Docket reports `external-auth-configured` through CogMesh.
- Docket canonical API URL is live at `https://docket.phoenixvc.tech`.
- CogMesh-to-Docket usage ingestion is configured through `DOCKET_BASE_URL=https://docket.phoenixvc.tech` and `DOCKET_API_KEY`; the production smoke returned HTTP 202 through CogMesh and Docket logs showed HTTP 200 at `/usage/model-events`.
- The Sluice health endpoint does not perform a live model call; it reports configuration/routing readiness and `liveProbeAttempted=false`.

## Closeout Refresh - 2026-07-14

- Batch 2 source work is merged through `dev` commit `792454d`:
  - PR #512 migration package.
  - PR #513 routing Terraform settings.
  - PR #517 CogMesh Docket outbound usage forwarding.
  - PR #519 Docket usage auth settings.
  - PR #520 Docket API key deploy bridge.
  - PR #521/#523 agent-ops/schema cleanup and untracked artifact cleanup.
  - PR #524 Sluice gateway secret bridge durability.
  - PR #525 NeuralLiquid OIDC readiness record.
- Docket PR `phoenixvc/docket#99` is merged and Docket production deploy run `29308313859` completed successfully.
- CogMesh API deploy run `29274844076` completed successfully for the Docket API key bridge.
- GitHub repo variables now include:
  - `COGMESH_DOCKET_BASE_URL=https://docket.phoenixvc.tech`
  - `COGMESH_SLUICE_BASE_URL=https://litellm.sluice.phoenixvc.tech`
  - `COGMESH_SLUICE_MODEL=default`
  - `COGMESH_SLUICE_MAX_TOKENS=16384`
  - `COGMESH_SLUICE_API_KEY_SECRET_URI` pointing at the Sluice Key Vault `gateway-key` secret.
- GitHub repo secrets now include:
  - `COGMESH_DOCKET_API_KEY`
- The temporary direct `COGMESH_SLUICE_API_KEY` GitHub secret was removed after the Key Vault reference was configured.
- CogMesh production and staging API App Service settings now include `DOCKET_BASE_URL`, `DOCKET_API_KEY`, `SLUICE_BASE_URL`, Key Vault referenced `SLUICE_API_KEY`, `SLUICE_MODEL`, `SLUICE_MAX_TOKENS`, and `ALLOW_DIRECT_MODEL_PROVIDER=false`.
- The Sluice gateway key was rotated on 2026-07-14 after an app-setting value query exposed the previous value in local tool output.
- The production and staging `SLUICE_API_KEY` Key Vault references both report `Resolved`.
- Both production and staging API apps were restarted after Sluice settings were applied.
- `https://api.cognitivemesh.neuralliquid.ai/api/v1/sluice/health` now reports:
  - `status=configured`
  - `sluiceConfigured=true`
  - `directProviderFallbackAllowed=false`
  - `docketConfigured=true`
  - `docketMode=external-auth-configured`
- `https://cognitive-mesh-api-prod-staging.azurewebsites.net/api/v1/sluice/health` was rechecked after the Key Vault rotation and reports the same configured state.
- Authenticated Sluice gateway check succeeded:
  - `GET https://litellm.sluice.phoenixvc.tech/v1/models` returned HTTP 200 with the configured model routes when called with the gateway key.
- Docket health check succeeded:
  - `GET https://docket.phoenixvc.tech/health` returned HTTP 200 with `{"status":"ok","backend":"table"}`.
- Docket usage-ingestion smoke succeeded through CogMesh production:
  - `POST https://api.cognitivemesh.neuralliquid.ai/api/v1/docket/usage` returned HTTP 202 for correlation `codex-smoke-20260714134919`.
  - Docket production Container App logs show `POST /usage/model-events HTTP/1.1` returned `200 OK` at `2026-07-14T11:49:50Z`.
- NeuralLiquid GitHub Actions OIDC federated credentials were added to Entra app registration `nl-cognitive-mesh-github-actions`:
  - `repo:neuralliquid/cognitive-mesh:ref:refs/heads/dev`
  - `repo:neuralliquid/cognitive-mesh:ref:refs/heads/main`
  - `repo:neuralliquid/cognitive-mesh:environment:production`
- Source repo transfer settings snapshot:
  - Variables present on `phoenixvc/cognitive-mesh`: `AZURE_WEBAPP_RESOURCE_GROUP`, `COGMESH_DOCKET_BASE_URL`, `COGMESH_SLUICE_API_KEY_SECRET_URI`, `COGMESH_SLUICE_BASE_URL`, `COGMESH_SLUICE_MAX_TOKENS`, `COGMESH_SLUICE_MODEL`, `COGNITIVE_MESH_API_APP_NAME`, `COGNITIVE_MESH_FRONTEND_APP_NAME`, `NEXT_PUBLIC_MYSTIRA_AUTH_CLIENT_ID`, `NEXT_PUBLIC_MYSTIRA_TENANT_ID`.
  - Secrets present on `phoenixvc/cognitive-mesh`: `AZURE_CLIENT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_TENANT_ID`, `COGMESH_DOCKET_API_KEY`, `SONAR_HOST_URL`, `SONAR_TOKEN`.
- `neuralliquid/cognitive-mesh` now exists and is the canonical repository path. The previous `phoenixvc/cognitive-mesh` API path redirects to the transferred repository.
- Durability note: Terraform full apply still needs review because existing App Service drift can affect frontend settings and image tags, but Sluice secret wiring now uses the preferred Key Vault reference path.

Batch 2 closeout status:

- Complete for migration prep, routing, auth wiring, and production smoke evidence.
- Batch 2 itself was not a repository transfer. Batch 3 performed the transfer on 2026-07-14.
- Remaining before any full prod Terraform apply: reconcile frontend App Service drift.

Batch 3 transfer and target-org validation:

- Baton task: `3b3a125b-6db5-4d80-8fb2-422d20f9c9f0`.
- Transfer API call completed successfully; both `phoenixvc/cognitive-mesh` and `neuralliquid/cognitive-mesh` now resolve to `neuralliquid/cognitive-mesh`.
- Local `origin` was updated to `https://github.com/neuralliquid/cognitive-mesh.git`.
- Target repo remains public, default branch `dev`, issues/projects/wiki enabled, merge/squash/rebase enabled, delete-branch-on-merge disabled.
- Target repo variables and secrets are present by name; no secret values were read.
- Target repo environments returned by GitHub: `copilot` and `production`; production has no protection rules.
- Target repo has one disabled repository ruleset, `Main Branch Protection` (`13093301`), targeting the default branch.
- Target repo webhooks list is empty; GitHub Pages endpoint returns 404.
- Visible target collaborators: `JustAGhosT` admin and `mareeben` write. Before transfer, `mareeben` appeared as admin; this permission change should be reviewed if admin access is still required.
- Actions are enabled and workflows are active.
- OIDC app registration `nl-cognitive-mesh-github-actions` has NeuralLiquid federated subjects for `dev`, `main`, and `production`.
- Target-org deploy runs completed successfully:
  - API deploy run `29350528046`, image `myssharedacr.azurecr.io/cognitive-mesh-api:sha-5e0567a`.
  - Frontend deploy run `29350528139`, image `myssharedacr.azurecr.io/cognitive-mesh-frontend:sha-5e0567a`.
- Post-transfer health checks succeeded:
  - `https://cognitive-mesh-api-prod.azurewebsites.net/healthz`
  - `https://cognitive-mesh-api-prod-staging.azurewebsites.net/healthz`
  - `https://cognitive-mesh-frontend-prod.azurewebsites.net/api/health`
  - `https://cognitive-mesh-frontend-prod-staging.azurewebsites.net/api/health`
  - `https://api.cognitivemesh.neuralliquid.ai/api/v1/sluice/health`
  - `https://docket.phoenixvc.tech/health`

## Transfer Baseline Refresh - 2026-07-13

- PR #512 and PR #513 are merged into `dev`.
- Clean baseline worktree verified at `92aa06bffcfc981eea5cf981e0245ed8180c9bf5`.
- `dotnet build CognitiveMesh.sln` succeeded with 0 warnings and 0 errors.
- `dotnet test CognitiveMesh.sln --no-build` succeeded with 581 tests passed.
- `pnpm install` in `src/UILayer/web` succeeded from the lockfile; pnpm ignored dependency build scripts under its approval policy.
- `pnpm run lint` exited 0 with 53 existing warnings.
- `pnpm run test -- --runInBand` succeeded with 18 suites and 137 tests passed; existing React `act(...)` console warning observed.
- `pnpm run build` succeeded; existing Style Dictionary and Next config/deprecation warnings remain.
- At the time of this baseline, `gh auth status` included `admin:org`, `read:packages`, `repo`, and `user`, but the default GitHub OAuth token could not expand selected GitHub App repository coverage. This was later superseded by PAT-backed installation repository queries that cleared the active app-coverage gate.
- Classic PAT verification cleared the active GitHub App coverage gate:
  - Renovate (`101140936`) includes `phoenixvc/cognitive-mesh`.
  - Stilla (`116485390`) includes `phoenixvc/cognitive-mesh`.
  - Devin (`68460896`) does not include `phoenixvc/cognitive-mesh`, accepted because Devin is inactive for this transfer.
  - phoenixvc-actions-runner (`111911804`) has zero repositories, accepted because the runner app is not currently deployed.

## Batch 3 Org Migration Tasks

1. Review whether `mareeben` should be restored from write to admin on the transferred repository.
2. Reconcile frontend App Service Terraform drift before any full prod Terraform apply.
3. Decide DNS ownership timing:
   - Keep `mystira-workspace` DNS as a temporary bridge if it currently owns the zones.
   - Move NeuralLiquid-owned DNS/deployment state into NeuralLiquid-owned infra before long-term production.
4. Move NeuralLiquid-owned DNS/deployment state into NeuralLiquid-owned infra before long-term production.
5. Verify Docket-backed cost-attribution evidence before using the migration as funding evidence.

## Handoff - 2026-07-13 Sluice/Docket Migration Prep

```yaml
status: partial
migration_batch: "Phase 1 / Batch 1 pre-transfer; Sluice routing prep before org transfer"
work_completed:
  - Added standalone migration artifacts required by the Baton plan:
      - docs/migrations/2026-neuralliquid-cognitive-mesh/reference-inventory.md
      - docs/migrations/2026-neuralliquid-cognitive-mesh/rollback.md
      - docs/migrations/2026-neuralliquid-cognitive-mesh/verification.md
  - Added Terraform hooks for Cognitive Mesh API routing settings:
      - ALLOW_DIRECT_MODEL_PROVIDER=false
      - SLUICE_BASE_URL
      - Key Vault reference hook for SLUICE_API_KEY
      - SLUICE_MODEL
      - SLUICE_MAX_TOKENS
      - optional DOCKET_BASE_URL
      - staging.cognitivemesh.neuralliquid.ai CORS origin
  - Verified the intended prod Sluice base URL but left it gated on a managed API key reference:
      - https://litellm.sluice.phoenixvc.tech
  - Left the Docket base URL unset at the time because the canonical Docket endpoint was not yet approved for CogMesh until auth and usage-ingestion semantics were confirmed. Superseded on 2026-07-14: Docket usage ingestion is now configured and production-smoked.
  - Updated manifest and this handoff with the then-current Docket blocker.
  - Configured canonical Docket API hostname:
      - docket.phoenixvc.tech CNAME -> pvc-shared-costops-api.ashymushroom-1f7d8121.southafricanorth.azurecontainerapps.io
      - asuid.docket.phoenixvc.tech TXT -> Container App custom-domain verification ID
      - Azure managed certificate mc-pvc-shared-cos-docket-phoenixvc-0990 bound with SNI
evidence:
  - Azure Container App metadata confirms pvc-prod-sluice-ca has custom domain litellm.sluice.phoenixvc.tech.
  - DNS resolves for litellm.sluice.phoenixvc.tech and sluice.phoenixvc.tech.
  - Azure Container App metadata shows old pvc-shared-costops-api with no custom domain returned.
  - Local docket checkout still has generated pvc-costops-analytics naming and old pvc-shared-costops Azure resource names.
  - https://docket.phoenixvc.tech/health returned {"status":"ok","backend":"table"}.
  - https://docket.phoenixvc.tech/config/status returned backend=table and auth_disabled=false.
  - Azure Container App hostname list shows docket.phoenixvc.tech bound with SniEnabled.
files_changed:
  - docs/migrations/2026-neuralliquid-cognitive-mesh/handoff.md
  - docs/migrations/2026-neuralliquid-cognitive-mesh/manifest.yaml
  - docs/migrations/2026-neuralliquid-cognitive-mesh/reference-inventory.md
  - docs/migrations/2026-neuralliquid-cognitive-mesh/rollback.md
  - docs/migrations/2026-neuralliquid-cognitive-mesh/verification.md
  - infra/environments/prod/terragrunt.hcl
  - infra/main.tf
  - infra/modules/webapp-container/main.tf
  - infra/modules/webapp-container/variables.tf
  - infra/variables.tf
tickets_updated:
  - Baton CogMesh migration task 01a8c263-9a33-463c-9041-92109cbe9f6d logged with current status.
  - Created Docket blocker task e93d06b5-3ef6-4a4a-9692-9f1825022c81.
  - Related Docket task as blocking the CogMesh migration task.
tests_run:
  - terraform init -backend=false
  - terraform validate
  - terragrunt plan -no-color -target='module.webapps[0].azurerm_linux_web_app.api' -target='module.webapps[0].azurerm_linux_web_app_slot.api_staging'
verification:
  - Terraform init and validate succeeded.
  - Targeted API/App Service plan shows 0 add, 2 in-place changes, adding direct-provider blocking and the missing staging CORS origin when Sluice env hooks are unset.
  - DOCKET_BASE_URL is intentionally omitted from the plan while Docket auth and ingestion semantics are blocked.
blockers:
  - CogMesh-to-Docket service auth is identifiable but not wired; Docket supports Azure AD bearer tokens and optional X-API-Key, but CogMesh does not currently send either to Docket.
  - CogMesh-to-Docket production ingestion contract is not compatible yet; canonical Docket does not expose a model-usage ingestion endpoint matching CogMesh's local DocketUsageEvent.
  - CogMesh-to-Sluice auth scheme still needed production confirmation at the time. Superseded on 2026-07-14: Sluice auth is configured through a resolved Key Vault reference and gateway auth was verified.
  - Full prod Terragrunt plan is not apply-safe yet because frontend App Service drift would remove existing frontend settings and move images back to Terraform-managed values.
risks:
  - Applying the full prod plan without drift reconciliation could remove frontend app settings managed outside Terraform.
  - The canonical Docket hostname currently fronts the existing pvc-shared-costops-api Container App; Docket repo naming and Terraform resource names still need follow-up cleanup.
rollback_state:
  - No repository transfer had been performed in that earlier Batch 1/2 prep step. Superseded on 2026-07-14: Batch 3 transferred the repository to `neuralliquid/cognitive-mesh`.
  - No Terraform apply performed.
  - Docket hostname rollback is to repoint docket.phoenixvc.tech CNAME away from the Container App and remove the Container App hostname binding.
  - Cognitive Mesh changes remain local documentation and Terraform configuration only.
next_action:
  - Keep CogMesh-to-Docket usage ingestion configured through `https://docket.phoenixvc.tech`; production smoke succeeded on 2026-07-14.
  - Reconcile frontend App Service Terraform drift before any full prod apply.
  - Continue CogMesh org migration with OIDC federated credentials, target-org secrets/variables, app-installation coverage, and DNS/custom-domain ownership checks.
funding_impact:
  - Positive once resolved: Docket plus Sluice will provide credible model usage/cost evidence for AI-credit applications.
  - Current state remains partial because cost attribution is not yet canonical/live through Docket.
```
