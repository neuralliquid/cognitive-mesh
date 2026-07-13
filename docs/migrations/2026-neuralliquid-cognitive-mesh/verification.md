# Verification Record - NeuralLiquid Cognitive Mesh Migration

Generated: 2026-07-13

Scope: `phoenixvc/cognitive-mesh` to `neuralliquid/cognitive-mesh`.

## Current Status

Status: Batch 2 partial / blocked.

Reason: Batch 2 migration artifacts exist and were refreshed on 2026-07-13, but the repository transfer remains blocked by model-egress and dependency-readiness work. PR #512 and PR #513 are merged into `dev`; the clean transfer baseline now builds and tests at commit `92aa06bffcfc981eea5cf981e0245ed8180c9bf5`. CogMesh should route model calls through Sluice and should not configure Docket production usage attribution until CogMesh-to-Docket auth and ingestion semantics are implemented against the canonical Docket endpoint.

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
- Inspected Docket OpenAPI and source routes. The canonical Docket API exposes cost-centre, resource-group, budget, dashboard, action-log, and resource-action routes. It does not expose a CogMesh-compatible `POST /usage`, `POST /api/v1/docket/usage`, or equivalent model-usage ingestion route.
- Inspected Cognitive Mesh Docket integration. `src/ApiHost/Program.cs` exposes local `GET /api/v1/docket/usage/recent` and `POST /api/v1/docket/usage`, backed by `InMemoryDocketUsageRecorder`; `DOCKET_BASE_URL` only changes status reporting to `external-ready` and does not currently wire outbound ingestion to Docket.
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
- Docket authenticated usage-ingestion route from CogMesh after Docket exposes or documents a compatible ingestion contract.

## Blockers

- CogMesh-to-Docket service auth is identifiable but not wired: Docket supports Azure AD bearer tokens and optional `X-API-Key`, but CogMesh does not currently send either to Docket.
- CogMesh-to-Docket production ingestion contract is blocked: Docket does not currently expose a matching model-usage ingestion endpoint for CogMesh's local `DocketUsageEvent` shape.
- CogMesh-to-Sluice auth scheme still needs production confirmation.
- Repository transfer must not proceed until blockers are resolved, even though the clean source build/test baseline is now recorded.

## Next Verification Action

1. Define and implement the Docket model-usage ingestion endpoint or adapter contract, including service auth.
2. Configure CogMesh `DOCKET_BASE_URL` only after Docket has a compatible authenticated ingestion route.
3. Confirm CogMesh-to-Sluice production auth.
4. Run full Terraform validation and prod plan after frontend App Service drift is reconciled.
