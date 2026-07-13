# Verification Record - NeuralLiquid Cognitive Mesh Migration

Generated: 2026-07-13

Scope: `phoenixvc/cognitive-mesh` to `neuralliquid/cognitive-mesh`.

## Current Status

Status: Batch 2 partial / blocked.

Reason: Batch 2 migration artifacts exist and were refreshed on 2026-07-13, but the repository transfer remains blocked by model-egress and dependency-readiness work. The migration package is isolated in PR #512 from `origin/dev`, and Terraform routing settings are isolated in companion PR #513. CogMesh should route model calls through Sluice and should not configure Docket production usage attribution until CogMesh-to-Docket auth and ingestion semantics are confirmed against the canonical Docket endpoint.

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

## Changes To Verify Before Applying

- API build after merging onto the current `dev` branch.
- Full Terragrunt plan after frontend App Service drift is reconciled.
- Production API app settings after apply.
- Sluice authenticated route from CogMesh after auth is configured.
- Docket authenticated usage-ingestion route from CogMesh after auth is configured.

## Blockers

- Migration package and Terraform routing edits are split into clean PR branches, but they are not merged yet.
- CogMesh-to-Docket auth scheme is not confirmed.
- CogMesh-to-Docket production ingestion contract is not confirmed against `https://docket.phoenixvc.tech`.
- CogMesh-to-Sluice auth scheme still needs production confirmation.
- Selected-repository GitHub App coverage still needs confirmation before transfer; installation IDs are known, but repository selection expansion is blocked by OAuth scope or manual org UI review.
- Repository transfer must not proceed until blockers are resolved and a clean build/test baseline is recorded.

## Next Verification Action

1. Review and merge migration package PR #512 and Terraform routing PR #513 if accepted.
2. Confirm selected app repository coverage manually in GitHub org settings or refresh `gh` with OAuth `user` scope and rerun the installation repository queries.
3. Confirm CogMesh-to-Docket auth and usage-ingestion contract against `https://docket.phoenixvc.tech`.
4. Configure CogMesh `DOCKET_BASE_URL` only after that endpoint contract and auth scheme are confirmed.
5. Run Terraform validation and prod plan.
6. Re-run API/frontend build checks from a clean `dev` baseline.
