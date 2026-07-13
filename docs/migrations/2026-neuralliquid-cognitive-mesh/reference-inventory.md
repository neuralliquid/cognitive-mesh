# Reference Inventory - NeuralLiquid Cognitive Mesh Migration

Generated: 2026-07-13

Scope: `phoenixvc/cognitive-mesh` to `neuralliquid/cognitive-mesh`.

This file is the standalone reference inventory required by the migration plan. Detailed source evidence remains in `manifest.yaml` and `pre-transfer-snapshot.md`.

## Active References To Replace Or Validate

- GitHub repository URL: `https://github.com/phoenixvc/cognitive-mesh`
  - Classification: active reference.
  - Action: replace active clone, badge, issue, workflow and automation links after transfer; validate GitHub redirect.
- GitHub clone URL: `https://github.com/phoenixvc/cognitive-mesh.git`
  - Classification: active reference.
  - Action: replace clone instructions and local automation remotes after transfer.
- GitHub Actions provenance: `${{ github.server_url }}/${{ github.repository }}`
  - Classification: active automation reference.
  - Action: verify image labels, attestations and deployment metadata after transfer.
- Deployment workflows: `.github/workflows/deploy.yml` and `.github/workflows/deploy-frontend.yml`
  - Classification: active deployment references.
  - Action: validate from the target repository after OIDC and secrets are recreated.

## Current Ownership Statements To Rewrite

- `README.md` currently positions Cognitive Mesh as part of the PhoenixVC platform.
- GitHub repository description says `Relaunching as neuralliquid.ai`.
- Repository topics include both `phoenixvc` and `neuralliquid`.

Action: rewrite current ownership language to NeuralLiquid while preserving the PhoenixVC incubation note.

## PhoenixVC-Hosted Dependencies To Retain

These are not part of the Cognitive Mesh repository transfer:

- `phoenixvc/sluice` - model routing, provider credentials, fallbacks, rate limits, cost controls, observability and AI egress policy.
- `phoenixvc/docket` - cost attribution and usage analytics. Former `shared-costops`/`pvc-costops-analytics` naming is still visible in local docs and Azure resources.
- `phoenixvc/retort` - scaffolding and build-time tooling.
- `phoenixvc/deck` - operator tooling.
- `phoenixvc/baton` - cross-repository task graph.
- `phoenixvc/org-meta` - PhoenixVC metadata until a NeuralLiquid-owned registry exists.
- `phoenixvc/mcp-org` - cross-repository MCP aggregation.
- `phoenixvc/mystira-workspace` - temporary DNS/deployment bridge where it still owns zones.

Action: keep PhoenixVC ownership where these are true dependencies and clarify the cross-organisation boundary.

## Generated Sources

- `.github/pr-361-review-issues.json`
  - Classification: generated output.
  - Action: find source workflow/generator before editing.
- `src/UILayer/web/src/lib/api/generated`
  - Classification: generated output.
  - Action: fix OpenAPI/source generator and regenerate rather than hand-editing.

## Deployment And Runtime References

- Shared ACR: `myssharedacr.azurecr.io`
  - Classification: active shared infrastructure.
  - Action: retain for initial NeuralLiquid deployments.
- Cognitive Mesh App Services:
  - `cognitive-mesh-api-prod`
  - `cognitive-mesh-frontend-prod`
  - `cognitive-mesh-api-prod-staging`
  - `cognitive-mesh-frontend-prod-staging`
  - Classification: active production resources.
  - Action: retain through transfer; validate final deploys from target org.
- Sluice gateway:
  - `https://litellm.sluice.phoenixvc.tech`
  - Classification: PhoenixVC-hosted dependency.
  - Action: configure as `SLUICE_BASE_URL` for CogMesh model egress once auth is confirmed.
- Docket API:
  - Classification: blocker.
  - Action: do not point CogMesh production at the old `pvc-shared-costops-api` URL as the canonical Docket dependency. Get `phoenixvc/docket` live under its canonical API URL/domain first, then set `DOCKET_BASE_URL`.
- Direct provider configuration:
  - `providersettings.json`, local docker-compose/k8s manifests, and local tooling still expose Azure OpenAI/OpenAI-oriented variable names.
  - Classification: migration-sensitive direct-provider reference.
  - Action: keep provider secrets quarantined and route production model egress through Sluice; allow direct-provider configuration only as a local shim or explicitly approved exception.

## Historical Records To Preserve

- Migration handoffs and audit records under `docs/migrations/`.
- Historical ADRs and archived analysis that accurately describe past PhoenixVC incubation or old project names.

Action: preserve history; add current-location notes only where needed.

## Unknown Or Blocked References

- Selected-repository GitHub App access for Renovate, Stilla, Devin and phoenixvc-actions-runner still needs manual/API confirmation. Installation IDs are known, but `/user/installations/{installation_id}/repositories` returned 403 and requires OAuth `user` scope.
- Docket canonical production endpoint and CogMesh-to-Docket auth scheme are not confirmed.
- CogMesh-to-Sluice production auth scheme is not confirmed.
- Batch 2 edits are now split into clean PR branches: migration package PR #512 and Terraform routing PR #513.
- Direct model-provider secrets should remain quarantined until all model egress is verified through Sluice.
