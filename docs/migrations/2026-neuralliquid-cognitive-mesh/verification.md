# Verification Record - NeuralLiquid Cognitive Mesh Migration

Generated: 2026-07-13

Scope: `phoenixvc/cognitive-mesh` to `neuralliquid/cognitive-mesh`.

## Current Status

Status: Batch 2 closeout complete; Batch 3 repository transfer completed and target-org deploys verified.

Reason: Batch 2 migration artifacts, routing prep, deploy-workflow durability, Docket usage forwarding, Docket auth settings, and Sluice Key Vault reference wiring are merged into `dev`. Production and staging report Sluice configured, direct provider fallback disabled, and Docket external auth configured. Batch 3 transferred the repository to `neuralliquid/cognitive-mesh`, validated target repository settings by name, confirmed NeuralLiquid OIDC subjects, and ran API/frontend deploys from the target org.

## Evidence Reviewed

- `CLAUDE.md`
- `AGENTS.md`
- `docs/plans/neuralliquid-cognitive-mesh-cleanup.md` in Baton
- `docs/plans/neuralliquid-migration-preflight-status.md` in Baton
- `docs/migrations/2026-neuralliquid-cognitive-mesh/manifest.yaml`
- `docs/migrations/2026-neuralliquid-cognitive-mesh/pre-transfer-snapshot.md`
- `docs/migrations/2026-neuralliquid-cognitive-mesh/handoff.md`

## Production Checks Previously Recorded

From `handoff.md`:

- `https://api.cognitivemesh.neuralliquid.ai/api/v1/model-routing/summary` returned `200`.
- `https://api.cognitivemesh.neuralliquid.ai/api/v1/sluice/health` returned `200`.
- `https://api.cognitivemesh.neuralliquid.ai/api/v1/docket/usage/recent` returned `200`.
- `https://cognitive-mesh.neuralliquid.ai/control` redirected to login as expected.
- `https://cognitive-mesh-frontend-prod.azurewebsites.net/api/health` returned healthy after frontend deploy.

These checks verify status surfaces, not full live Sluice model execution or canonical Docket ingestion.

## Local Verification Performed This Session

- Fetched `origin` and confirmed `origin/dev` at `5b76bf34389b0a82dcc546c2eb09d0494cb09e1e`.
- Confirmed current local branch `agent/adaptive-balance-control-widget` at `5ba6d9d0e96611baed977cf9c439cb58a5a4d708` with uncommitted Batch 2/Sluice-routing prep.
- Confirmed the standalone Batch 2 artifacts exist: `manifest.yaml`, `pre-transfer-snapshot.md`, `reference-inventory.md`, `rollback.md`, and `verification.md`.
- Confirmed one open PR exists, Renovate PR #494 (`renovate/pin-dependencies`) targeting `dev`; it does not overlap with the migration artifact/Terraform scope.
- Narrowed selected GitHub App blocker to installation IDs for Renovate (`101140936`), Stilla (`116485390`), Devin (`68460896`) and phoenixvc-actions-runner (`111911804`).
- Retried selected app repository expansion through `/user/installations/{installation_id}/repositories`; GitHub returned 403 and requested OAuth `user` scope.
- Reviewed direct model-provider routing code paths.
- Confirmed `LLMClientFactory` prefers Sluice when `SLUICE_BASE_URL` is configured and blocks direct providers unless `ALLOW_DIRECT_MODEL_PROVIDER` is explicitly enabled.
- Confirmed `SluiceLLMProvider` exists for protocol-level completions and embeddings.
- Queried Azure Container Apps metadata:
  - Sluice LiteLLM gateway: `pvc-prod-sluice-ca`, custom domain `litellm.sluice.phoenixvc.tech`.
  - Sluice dashboard: `pvc-prod-sluice-dashboard`, custom domain `sluice.phoenixvc.tech`.
  - Old CostOps API: `pvc-shared-costops-api`, no custom domain returned.
- Confirmed DNS resolves for:
  - `litellm.sluice.phoenixvc.tech`
  - `sluice.phoenixvc.tech`
- Confirmed local `docket` checkout still has generated `pvc-costops-analytics` naming and Azure resources still use `pvc-shared-costops-*`.
- Configured Docket canonical API hostname:
  - `docket.phoenixvc.tech` CNAME points to `pvc-shared-costops-api.ashymushroom-1f7d8121.southafricanorth.azurecontainerapps.io`.
  - `asuid.docket.phoenixvc.tech` TXT contains the Container App custom-domain verification ID.
  - Managed certificate `mc-pvc-shared-cos-docket-phoenixvc-0990` is `Succeeded`.
  - Container App hostname list shows `docket.phoenixvc.tech` with `SniEnabled`.
- Verified `https://docket.phoenixvc.tech/health` returns `{"status":"ok","backend":"table"}`.
- Verified `https://docket.phoenixvc.tech/config/status` returns `backend=table` and `auth_disabled=false`.
- Ran `terraform init -backend=false` in `infra`: succeeded.
- Ran `terraform validate` in `infra`: succeeded.
- Ran targeted `terragrunt plan -no-color` for the API App Service and API staging slot. With Sluice environment hooks unset, the plan shows two in-place API resource updates to add `ALLOW_DIRECT_MODEL_PROVIDER=false` and the missing CORS origin only. `SLUICE_BASE_URL`, `SLUICE_API_KEY`, and `DOCKET_BASE_URL` are intentionally not present until auth and ingestion contracts are confirmed.

## Refresh - 2026-07-13

- Confirmed `gh auth status` after refresh shows token scopes `admin:org`, `gist`, `read:packages`, `repo`, and `user`.
- Retried selected GitHub App repository expansion for Devin (`68460896`), Renovate (`101140936`), phoenixvc-actions-runner (`111911804`), and Stilla (`116485390`) via `/user/installations/{installation_id}/repositories`.
- GitHub still returned HTTP 403 for all four installation IDs: the endpoint requires a GitHub App-authorized token, a PAT, or basic auth. The OAuth `user` scope did not clear this blocker in the current CLI environment.
- Retried the same installation repository queries with a classic PAT accepted by GitHub's installation repositories endpoint.
- Confirmed Renovate (`101140936`) includes `phoenixvc/cognitive-mesh`.
- Confirmed Stilla (`116485390`) includes `phoenixvc/cognitive-mesh`.
- Confirmed Devin (`68460896`) does not include `phoenixvc/cognitive-mesh`; this is acceptable because Devin is inactive for this transfer.
- Confirmed phoenixvc-actions-runner (`111911804`) has zero repositories; this is acceptable because the runner app is not currently deployed.
- Selected GitHub App repository coverage is therefore no longer a transfer blocker for Batch 2: the active/required apps are covered, and the uncovered apps are explicitly not required.
- Re-verified canonical Docket repository as `phoenixvc/docket`.
- Re-verified `https://docket.phoenixvc.tech/health` returns HTTP 200 with `{"status":"ok","backend":"table"}`.
- Re-verified `https://docket.phoenixvc.tech/config/status` returns HTTP 200 with `backend=table`, `auth_disabled=false`, Azure AD client id `f6c75495-4566-4263-9045-d2f4818b892d`, and tenant id `7edf4423-ccb3-4275-bc80-64dae3ef0148`.
- Re-verified `https://docket.phoenixvc.tech/openapi.json` returns HTTP 200.
- Inspected Docket auth implementation. Docket protected endpoints use `Authorization: Bearer <token>` with Azure AD JWT validation when `AZURE_AD_TENANT_ID` and `AZURE_AD_CLIENT_ID` are set, with `X-API-Key` as a service-to-service fallback when `API_KEY` is configured.
- Implemented Docket PR `phoenixvc/docket#99`, adding protected model-usage ingestion routes at `POST /usage/model-events` and `POST /api/v1/usage/model-events`. JWT callers require the `Docket.UsageIngest` role; the existing `X-API-Key` service fallback remains available for initial smoke testing.
- Implemented Cognitive Mesh Docket outbound usage client support. `src/ApiHost/Program.cs` now keeps recent usage locally and forwards recorded `DocketUsageEvent` payloads to Docket when `DOCKET_BASE_URL` is configured. Auth is selected in this order: `DOCKET_API_KEY`, `DOCKET_BEARER_TOKEN`, then Entra token acquisition from `DOCKET_SCOPE` or `DOCKET_AUDIENCE`.
- Updated clean baseline worktree to `origin/dev` at `92aa06bffcfc981eea5cf981e0245ed8180c9bf5`.
- Ran `dotnet build CognitiveMesh.sln`: succeeded with 0 warnings and 0 errors.
- Ran `dotnet test CognitiveMesh.sln --no-build`: succeeded, 581 tests passed.
- Ran `pnpm install` in `src/UILayer/web`: succeeded from the lockfile; pnpm ignored build scripts for `esbuild`, `sharp`, and `unrs-resolver` under its approval policy.
- Ran `pnpm run lint` in `src/UILayer/web`: exited 0 with 53 existing warnings.
- Ran `pnpm run test -- --runInBand` in `src/UILayer/web`: succeeded, 18 suites and 137 tests passed; existing React `act(...)` console warning observed in `AuthContext.test.tsx`.
- Ran `pnpm run build` in `src/UILayer/web`: succeeded; existing warnings remain for Style Dictionary token collisions, unsupported `eslint` key in `next.config.js`, and deprecated `middleware` convention.

## Changes To Verify Before Applying

- Full Terragrunt plan after frontend App Service drift is reconciled.
- Production API app settings after apply.
- Sluice authenticated route from CogMesh after auth is configured.
- Docket authenticated usage-ingestion route from CogMesh after Docket PR #99 and the CogMesh outbound client PR are merged and deployed with production settings.

## Historical Blockers

- CogMesh-to-Docket code-level contract was implemented and production-smoked on 2026-07-14.
- CogMesh-to-Sluice production auth was confirmed with the gateway key and is now wired through a Key Vault reference.
- Selected GitHub App repository coverage was cleared by PAT-backed installation repository queries.
- The remaining transfer gate was operational, not Batch 2 implementation. It was cleared when the operator approved Batch 3 execution on 2026-07-14.

## Next Verification Action

1. Review whether `mareeben` should be restored from write to admin on the transferred repository.
2. Reconcile or explicitly accept frontend App Service Terraform drift before any full prod apply.
3. Move NeuralLiquid-owned DNS/deployment state into NeuralLiquid-owned infrastructure before long-term production.
4. Verify Docket-backed cost-attribution readiness from the Sluice-routed CogMesh usage path before using the transfer as funding evidence.

## Refresh - 2026-07-14

- Fetched `origin` and confirmed local `dev` at `eac1d23`, matching `origin/dev`.
- Confirmed open CogMesh PR list contains only Renovate PR #494 (`renovate/pin-dependencies`), unrelated to the migration transfer path.
- Confirmed Docket PR `phoenixvc/docket#99` is merged.
- Confirmed recent Docket production deploy run `29308313859` completed successfully.
- Confirmed recent CogMesh API deploy run `29274844076` completed successfully for commit `b588922`.
- Confirmed CogMesh repo variables include `COGMESH_DOCKET_BASE_URL`, `COGMESH_SLUICE_BASE_URL`, `COGMESH_SLUICE_MODEL`, and `COGMESH_SLUICE_MAX_TOKENS`.
- Confirmed CogMesh repo secrets include `COGMESH_DOCKET_API_KEY` and `COGMESH_SLUICE_API_KEY`.
- Applied Sluice settings to `cognitive-mesh-api-prod` and its `staging` slot:
  - `SLUICE_BASE_URL=https://litellm.sluice.phoenixvc.tech`
  - `SLUICE_MODEL=default`
  - `SLUICE_MAX_TOKENS=16384`
  - `SLUICE_API_KEY` now set through a Key Vault reference to the Sluice `gateway-key` secret.
- Restarted the production API app and staging slot.
- Verified both production and staging `/api/v1/sluice/health` return `status=configured`, `sluiceConfigured=true`, `directProviderFallbackAllowed=false`, `docketConfigured=true`, and `docketMode=external-auth-configured`.
- Verified unauthenticated Sluice `/v1/models` returns HTTP 401, confirming gateway model routes require an API key.
- Verified authenticated Sluice `/v1/models` returns HTTP 200 and the configured route list when called with the gateway key.
- Verified `https://docket.phoenixvc.tech/health` returns HTTP 200 with `{"status":"ok","backend":"table"}`.
- Verified `https://docket.phoenixvc.tech/openapi.json` returns the model usage ingestion routes `/usage/model-events` and `/api/v1/usage/model-events`.
- Ran a production Docket usage-ingestion smoke through CogMesh:
  - CogMesh `POST /api/v1/docket/usage` returned HTTP 202 for correlation `codex-smoke-20260714134919`.
  - Docket production Container App logs show `POST /usage/model-events HTTP/1.1` returned HTTP 200 at `2026-07-14T11:49:50Z`.
- Updated `.github/workflows/deploy.yml` to support `COGMESH_SLUICE_API_KEY` as a temporary direct-secret bridge in addition to the preferred `COGMESH_SLUICE_API_KEY_SECRET_URI` Key Vault path.
- Set `COGMESH_SLUICE_API_KEY_SECRET_URI` to the Sluice Key Vault `gateway-key` secret URI.
- Removed the temporary direct `COGMESH_SLUICE_API_KEY` GitHub secret after Key Vault wiring was in place.
- Rotated the Sluice gateway key on 2026-07-14 after an app-setting value query exposed the previous value in local tool output.
- Verified Azure config-reference status for production and staging `SLUICE_API_KEY` is `Resolved`.
- Added NeuralLiquid GitHub Actions OIDC federated credential subjects to Entra app registration `nl-cognitive-mesh-github-actions`:
  - `repo:neuralliquid/cognitive-mesh:ref:refs/heads/dev`
  - `repo:neuralliquid/cognitive-mesh:ref:refs/heads/main`
  - `repo:neuralliquid/cognitive-mesh:environment:production`
- Verified both PhoenixVC and NeuralLiquid federated subjects are present on the deployment identity.
- Historical pre-transfer check: `neuralliquid/cognitive-mesh` returned GitHub HTTP 404 before the repository transfer.
- Captured current source repository variable and secret names for transfer validation; no secret values were recorded.

## Batch 2 Closeout Refresh - 2026-07-14

- Confirmed local `dev` matches `origin/dev` at `792454d`, after PR #524 and PR #525.
- Confirmed only open source-repo PR is Renovate PR #494 (`renovate/pin-dependencies`), unrelated to migration transfer.
- Confirmed source repo variables: `AZURE_WEBAPP_RESOURCE_GROUP`, `COGMESH_DOCKET_BASE_URL`, `COGMESH_SLUICE_API_KEY_SECRET_URI`, `COGMESH_SLUICE_BASE_URL`, `COGMESH_SLUICE_MAX_TOKENS`, `COGMESH_SLUICE_MODEL`, `COGNITIVE_MESH_API_APP_NAME`, `COGNITIVE_MESH_FRONTEND_APP_NAME`, `NEXT_PUBLIC_MYSTIRA_AUTH_CLIENT_ID`, and `NEXT_PUBLIC_MYSTIRA_TENANT_ID`.
- Confirmed source repo secrets by name only: `AZURE_CLIENT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_TENANT_ID`, `COGMESH_DOCKET_API_KEY`, `SONAR_HOST_URL`, and `SONAR_TOKEN`.
- Confirmed source repo environments returned by GitHub: `copilot` and `production`.
- Confirmed production and staging `/api/v1/sluice/health` return `status=configured`, `sluiceConfigured=true`, `directProviderFallbackAllowed=false`, `docketConfigured=true`, and `docketMode=external-auth-configured`.
- Confirmed production and staging App Service Key Vault references for `SLUICE_API_KEY` report `Resolved` through ARM config-reference reads.
- Confirmed `https://docket.phoenixvc.tech/health` returns `{"status":"ok","backend":"table"}`.
- Historical pre-transfer check: `neuralliquid/cognitive-mesh` still returned GitHub HTTP 404 before the repository transfer.

## Batch 3 Pre-Transfer Discovery - 2026-07-14

- Baton Batch 3 task opened: `3b3a125b-6db5-4d80-8fb2-422d20f9c9f0`.
- Source repository metadata: public repository, default branch `dev`, issues/projects/wiki enabled, squash/merge/rebase all allowed, delete-branch-on-merge disabled.
- Source branches returned by GitHub include `dev`, `main`, `gh-pages`, active agent/renovate/dependabot branches, and historical feature branches; none are reported protected.
- Source repository rulesets: one repository branch ruleset, `Main Branch Protection` (`13093301`), target default branch, enforcement `disabled`.
- Source production environment exists and has no protection rules or deployment branch policy.
- Source repository webhooks list is empty.
- Source repository topics: `agent-orchestration`, `azure-openai`, `compliance`, `governance`, `observability`, `rbac`, `agent`, `ai`, `csharp`, `dotnet`, `reasoning`, `typescript`, `active`, `phoenixvc`, `neuralliquid`.
- Source repository collaborators visible through GitHub: `mareeben` admin and `JustAGhosT` admin.
- GitHub Pages endpoint returns 404, so no active Pages site was visible through the repository Pages API.
- Historical pre-transfer check: target organization `neuralliquid` was visible; target repository `neuralliquid/cognitive-mesh` still returned GitHub HTTP 404 before transfer.

## Batch 3 Transfer And Target Validation - 2026-07-14

- Operator approved continuing Batch 3 with "lets go".
- Transferred `phoenixvc/cognitive-mesh` to `neuralliquid/cognitive-mesh` through GitHub's repository transfer API.
- Verified both old and new repository API paths resolve to `neuralliquid/cognitive-mesh`.
- Updated local `origin` to `https://github.com/neuralliquid/cognitive-mesh.git`.
- Verified target repository variables by name: `AZURE_WEBAPP_RESOURCE_GROUP`, `COGMESH_DOCKET_BASE_URL`, `COGMESH_SLUICE_API_KEY_SECRET_URI`, `COGMESH_SLUICE_BASE_URL`, `COGMESH_SLUICE_MAX_TOKENS`, `COGMESH_SLUICE_MODEL`, `COGNITIVE_MESH_API_APP_NAME`, `COGNITIVE_MESH_FRONTEND_APP_NAME`, `NEXT_PUBLIC_MYSTIRA_AUTH_CLIENT_ID`, and `NEXT_PUBLIC_MYSTIRA_TENANT_ID`.
- Verified target repository secrets by name only: `AZURE_CLIENT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_TENANT_ID`, `COGMESH_DOCKET_API_KEY`, `SONAR_HOST_URL`, and `SONAR_TOKEN`.
- Verified target repository environments: `copilot` and `production`; production has no protection rules or deployment branch policy.
- Verified target repository ruleset `Main Branch Protection` (`13093301`) exists and remains disabled.
- Verified target repository hooks list is empty, Pages endpoint returns 404, Actions are enabled, and workflows are active.
- Verified visible target collaborators: `JustAGhosT` admin and `mareeben` write. Before transfer, `mareeben` appeared as admin; review whether this should be restored.
- Verified OIDC app registration `nl-cognitive-mesh-github-actions` includes NeuralLiquid subjects:
  - `repo:neuralliquid/cognitive-mesh:ref:refs/heads/dev`
  - `repo:neuralliquid/cognitive-mesh:ref:refs/heads/main`
  - `repo:neuralliquid/cognitive-mesh:environment:production`
- Triggered and watched target-org deploy runs:
  - API deploy run `29350528046`: succeeded.
  - Frontend deploy run `29350528139`: succeeded.
- Verified deployed App Service images through ARM:
  - `DOCKER|myssharedacr.azurecr.io/cognitive-mesh-api:sha-5e0567a`
  - `DOCKER|myssharedacr.azurecr.io/cognitive-mesh-frontend:sha-5e0567a`
- Verified post-transfer health:
  - API prod `/healthz`: `{"status":"ok"}`
  - API staging `/healthz`: `{"status":"ok"}`
  - Frontend prod `/api/health`: `{"status":"healthy"}`
  - Frontend staging `/api/health`: `{"status":"healthy"}`
  - Sluice health reports `status=configured`, `sluiceConfigured=true`, `directProviderFallbackAllowed=false`, `docketConfigured=true`, and `docketMode=external-auth-configured`.
  - Docket health returns `{"status":"ok","backend":"table"}`.

## Remaining After Transfer

1. Baton Evidence and Claims Auditor: validate that public migration/funding claims distinguish implemented Sluice/Docket routing from remaining hardening tasks.

## Post-Transfer Hardening - 2026-07-14

- Restored `mareeben` to `admin` on `neuralliquid/cognitive-mesh`; visible collaborators now show `JustAGhosT` admin and `mareeben` admin.
- Reconciled prod App Service Terraform drift before full apply:
  - Pinned API and frontend container images to the post-transfer deployed tag `sha-5e0567a`.
  - Added Terraform-managed frontend server-side Mystira identity settings and preview navigation setting.
  - Added Key Vault reference variables for future Docket and Mystira OIDC secret ownership.
  - Preserved currently live `DOCKET_API_KEY` and `MYSTIRA_OIDC_CLIENT_SECRET` app settings with `ignore_changes` until those secrets are moved to Key Vault references.
- Ran `terragrunt validate --working-dir infra/environments/prod`: succeeded.
- Ran `terragrunt apply -auto-approve --working-dir infra/environments/prod` after a zero-destroy plan: `0 added, 3 changed, 0 destroyed`.
- Ran post-apply health checks:
  - API prod `/healthz`: `{"status":"ok"}`
  - API staging `/healthz`: `{"status":"ok"}`
  - Frontend prod `/api/health`: `{"status":"healthy"}`
  - Frontend staging `/api/health`: `{"status":"healthy"}`
- Ran post-apply `terragrunt plan -no-color --working-dir infra/environments/prod`: no changes.
- Renamed root Terragrunt config from `infra/terragrunt.hcl` to `infra/root.hcl` and updated environment includes to `find_in_parent_folders("root.hcl")`; prod validation no longer emits the Terragrunt root-file anti-pattern warning.
- Moved long-term Cognitive Mesh public DNS records into NeuralLiquid-owned Terraform state:
  - Added Terraform resources for CNAME records `cognitive-mesh`, `control.cognitive-mesh`, and `api.cognitivemesh` in the `neuralliquid.ai` Azure DNS zone.
  - Added Terraform resources for App Service verification TXT records `asuid.cognitive-mesh`, `asuid.control.cognitive-mesh`, and `asuid.api.cognitivemesh`.
  - Imported all six existing DNS record sets into prod state using Azure DNS resource IDs under `mys-global-shared-rg`.
- Verified DNS/custom-domain state after import:
  - `cognitive-mesh.neuralliquid.ai` and `control.cognitive-mesh.neuralliquid.ai` CNAME to `cognitive-mesh-frontend-prod.azurewebsites.net`.
  - `api.cognitivemesh.neuralliquid.ai` CNAMEs to `cognitive-mesh-api-prod.azurewebsites.net`.
  - API and frontend custom hostnames are `SniEnabled`.
  - `https://api.cognitivemesh.neuralliquid.ai/api/v1/sluice/health`, `https://cognitive-mesh.neuralliquid.ai/api/health`, and `https://control.cognitive-mesh.neuralliquid.ai/api/health` returned healthy/configured responses.
- Ran final prod `terragrunt plan -no-color --working-dir infra/environments/prod`: no changes.
- Verified Docket-backed attribution path with a synthetic smoke event:
  - CogMesh accepted `POST https://api.cognitivemesh.neuralliquid.ai/api/v1/docket/usage` for correlation `codex-docket-smoke-20260714233933`.
  - Docket Container App logs for `pvc-shared-costops-api` revision `pvc-shared-costops-api--0000018` showed `POST /usage/model-events HTTP/1.1` returned `200 OK` at `2026-07-14T21:40:05Z`.
  - Docket health returned `{"status":"ok","backend":"table"}`.
- Evidence caveat: this verifies the CogMesh-to-Docket ingestion path and a tiny synthetic cost event. Use it as technical readiness evidence, not as production funding evidence for real usage volume until actual Sluice-routed workload costs are accumulated and reviewed.
