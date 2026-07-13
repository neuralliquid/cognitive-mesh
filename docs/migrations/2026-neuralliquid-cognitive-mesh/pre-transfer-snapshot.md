# Pre-transfer Snapshot - NeuralLiquid Cognitive Mesh Migration

Generated: 2026-07-12

Scope: `phoenixvc/cognitive-mesh` to `neuralliquid/cognitive-mesh`.

This started as a metadata snapshot and now also records the local CI/CD and Terraform prep completed before transfer. It does not contain secret values.

## Repository

- Repository: `phoenixvc/cognitive-mesh`
- Target repository: `neuralliquid/cognitive-mesh`
- Repository ID: `965325775`
- Node ID: `R_kgDOOYmzzw`
- Visibility: public
- Archived: false
- Disabled: false
- Default branch: `dev`
- Latest fetched `origin/dev` SHA checked on 2026-07-13: `5b76bf34389b0a82dcc546c2eb09d0494cb09e1e`
- Current local branch checked on 2026-07-13: `agent/adaptive-balance-control-widget`
- HEAD SHA in local clone: `5ba6d9d0e96611baed977cf9c439cb58a5a4d708`
- Latest local commit: `5ba6d9d0e96611baed977cf9c439cb58a5a4d708 feat: wire live governance widgets`
- Snapshot caution: the original local discovery checkout was not a clean `dev` baseline. The migration package was later isolated into PR #512 from `origin/dev`; Terraform routing settings were isolated into companion PR #513.
- Repository description: `Enterprise agent/LLM platform - RBAC, audit, Azure OpenAI, RAG. Relaunching as neuralliquid.ai`
- Homepage: empty
- Primary language: C#
- License: none reported by GitHub API
- Topics: `active`, `agent`, `agent-orchestration`, `ai`, `azure-openai`, `compliance`, `csharp`, `dotnet`, `governance`, `neuralliquid`, `observability`, `phoenixvc`, `rbac`, `reasoning`, `typescript`
- Security and analysis in GitHub API:
  - Secret scanning: disabled
  - Secret scanning push protection: disabled
  - Dependabot security updates: disabled
  - Non-provider secret scanning: disabled
  - Secret validity checks: disabled

## Branches

Visible branches from GitHub API:

- `claude/compare-agent-frameworks-U3wR4` - `b64e6b2ebf9eb2018a3e739fe50c6e7a38242f18` - protected: false
- `dependabot/nuget/microsoft-2e217c2796` - `502d487f907acb0e8bf7deba5eb3f20310859b40` - protected: false
- `dependabot/nuget/microsoft-6b892c123f` - `dff4b7535571bafd4efefef85234b7b16d06d591` - protected: false
- `dev` - `da03b47e3a62989495b0d7715273ed30dd78dc39` - protected: false
- `feat/frontend-phase-15` - `7c6a1282c64c4a59c866434c70f012ba2a55d02e` - protected: false
- `fix/readme-stale-ecosystem-names` - `4f41f171c1517e7ac4bb251232899c63e2e9dd40` - protected: false
- `gh-pages` - `4259fb7a57c5d90942ef9fd306b4b576a549a6cd` - protected: false
- `main` - `eb1c27b7648e7090b0dfd50c86675bb11f1c0067` - protected: false
- `renovate/github-actions` - `7f862e3bd006c00a0abc8f1c5001b6de2d0abe35` - protected: false
- `renovate/xunit` - `b0205d1dba94c73ceec03d8aa9133c19cedab0e1` - protected: false
- `stilla/prelim-release-notes-2026-03-25` - `63946e0c79993694ced938d00773bb696393d60f` - protected: false

## Tags And Releases

- Tags: none returned by GitHub API.
- Releases:
  - Draft prerelease `v0.1.0 (draft)` targeting `dev`
  - Release ID: `301206285`
  - Author: `stilla[bot]`
  - Created: `2026-03-25T13:25:53Z`
  - Published: null
  - Assets: none

## Issues And Pull Requests

- GitHub repository metadata reports `open_issues_count: 234`.
- Open pull requests from `repos/phoenixvc/cognitive-mesh/pulls?state=open`: `0`.
- Inference: current open issue count is 234 because open PR count is 0.

## Branch Rules And Rulesets

Ruleset from GitHub API:

- Name: `Main Branch Protection`
- ID: `13093301`
- Target: branch
- Source: `phoenixvc/cognitive-mesh`
- Enforcement: disabled
- Condition: default branch only
- Rules:
  - deletion
  - non-fast-forward
  - pull request with 0 required approving reviews
  - CodeQL code scanning threshold: security alerts high or higher, alerts errors
  - code quality threshold: errors
  - Copilot code review on push and draft pull requests
- Bypass actors:
  - OrganizationAdmin, always
  - RepositoryRole actor ID 2, always
  - RepositoryRole actor ID 5, always
- Current user can bypass: always

No branch protection was enabled on individual branch records returned by the branches API.

## Environments And Approvals

GitHub API reports one environment:

- `copilot`
  - ID: `10801844275`
  - Created: `2025-12-21T07:47:00Z`
  - Updated: `2025-12-21T07:47:00Z`
  - Admin bypass: true
  - Protection rules: none
  - Deployment branch policy: null
  - Environment secrets: none
  - Environment variables: none

Workflow files originally referenced `staging` and `production`, but those environments were not returned by the environments API. Direct API checks for `staging` and `production` returned 404.

Follow-up: `production` was created on 2026-07-12. `staging` is no longer required as a GitHub Environment because it is treated as a production deployment slot.

## Actions Secrets And Variables

Repository-level Actions secret names visible through GitHub API:

- `SONAR_HOST_URL`
- `SONAR_TOKEN`

Repository-level Actions variables: none.

Organization-level Actions secrets and variables are now visible with refreshed scopes.

Organization-level Actions secret names:

- `AZURE_CLIENT_ID`
- `AZURE_CREDENTIALS`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_TENANT_ID`
- `CODECOV_SECRET`
- `GH_PACKAGES_TOKEN`
- `GH_PAT`
- `GITLEAKS_LICENSE`
- `GRAPHITE_CI_TOKEN`
- `KERNEL_API_KEY`
- `MYSTIRA_AZURE_CREDENTIALS`
- `MYSTIRA_DEVOPS_AZURE_ORG`
- `MYSTIRA_DEVOPS_AZURE_PAT`
- `MYSTIRA_DEVOPS_AZURE_PROJECT`
- `MYSTIRA_DEVOPS_NUGET_FEED`
- `MYSTIRA_GITHUB_SUBMODULE_ACCESS_TOKEN`
- `NUGET_API_KEY`
- `SENDGRID`

Organization-level Actions variables: none.

Secret-name mismatch:

- Present and relevant: `AZURE_CREDENTIALS`.
- Workflow references `CODECOV_TOKEN`, but org secret is named `CODECOV_SECRET`.
- Old workflow references `ACR_LOGIN_SERVER`, `ACR_USERNAME`, `ACR_PASSWORD`, `AKS_CLUSTER_NAME`, `AKS_RESOURCE_GROUP`, and `SLACK_WEBHOOK`; none were found at repository or organization level.
- Current deploy workflows no longer require ACR username/password secrets, AKS names, or Slack webhook.
- Current deploy workflows require variables:
  - `AZURE_WEBAPP_RESOURCE_GROUP`
  - `COGNITIVE_MESH_API_APP_NAME`
  - `COGNITIVE_MESH_FRONTEND_APP_NAME`

After prod Terragrunt apply, populate those variables from Terraform outputs:

```powershell
cd C:\tmp\cognitive-mesh\infra\environments\prod
$rg = terragrunt output -raw resource_group_name
$api = terragrunt output -raw api_app_service_name
$frontend = terragrunt output -raw frontend_app_service_name
gh variable set AZURE_WEBAPP_RESOURCE_GROUP -b $rg -R phoenixvc/cognitive-mesh
gh variable set COGNITIVE_MESH_API_APP_NAME -b $api -R phoenixvc/cognitive-mesh
gh variable set COGNITIVE_MESH_FRONTEND_APP_NAME -b $frontend -R phoenixvc/cognitive-mesh
```

Environment-level `copilot` secrets: none.

Environment-level `copilot` variables: none.

Workflow-required names observed in local files:

- `GITHUB_TOKEN`
- `CODECOV_TOKEN`
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_WEBAPP_RESOURCE_GROUP`
- `COGNITIVE_MESH_API_APP_NAME`
- `COGNITIVE_MESH_FRONTEND_APP_NAME`

These names must be validated as repository, organization, or environment secrets before transfer. No secret values were inspected or recorded.

## Webhooks, Deploy Keys, Apps

- Repository webhooks: none returned by API.
- Deploy keys: none returned by API.
- GitHub App installations visible at org level: 40.
- Relevant installed apps observed:
  - `renovate` - selected repositories
  - `stilla` - selected repositories
  - `codecov` - all repositories
  - `chatgpt-codex-connector` - all repositories
  - `claude` - all repositories
  - `cursor` - all repositories
  - `coderabbitai` - all repositories
  - `greptile-apps` - all repositories
  - `sentry` - all repositories
  - `vercel` - all repositories
  - `devin-ai-integration` - selected repositories
  - `phoenixvc-actions-runner` - selected repositories
- Selected-repository app installations still need repository selection confirmation before transfer, especially `renovate`, `stilla`, `devin-ai-integration`, and `phoenixvc-actions-runner`.
- Selected app installation IDs were narrowed on 2026-07-13:
  - `devin-ai-integration`: `68460896`
  - `renovate`: `101140936`
  - `phoenixvc-actions-runner`: `111911804`
  - `stilla`: `116485390`
- Attempting to expand selected app repository lists through `/user/installations/{installation_id}/repositories` still returned 403 on 2026-07-13 and requires the broader GitHub OAuth `user` scope, not only `read:user`.

## Pages

- Repository metadata reports `has_pages: false`.
- The Pages API returned 404 Not Found.
- The repository has a `gh-pages` branch, so confirm whether it is historical or expected future deployment material before transfer.

## Workflows

Workflow files present in `.github/workflows`:

- `api-docs.yml`
- `build.yml`
- `codeql.yml`
- `coverage.yml`
- `create-pr-review-issues.yml`
- `deploy-frontend.yml`
- `deploy.yml`
- `migrate.yml`

Recent Actions metadata:

- Total workflow runs reported: `3186`
- Recent runs include `PRD Migration Check` and `Code Coverage` on Renovate branches, with successful conclusions on 2026-07-12.

Deployment workflows:

- `deploy.yml`
  - Builds and pushes `cognitive-mesh-api`
  - Uses Azure login via OIDC secrets `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID`
  - Pushes to shared ACR `myssharedacr.azurecr.io`
  - Deploys to Azure Web App production plus `staging` slot
  - References URLs `https://staging.cognitivemesh.neuralliquid.ai` and `https://cognitivemesh.neuralliquid.ai`
  - Emits OCI source label from `${{ github.server_url }}/${{ github.repository }}`
- `deploy-frontend.yml`
  - Builds and pushes `cognitive-mesh-frontend`
  - Uses Azure login via OIDC secrets `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID`
  - Pushes to shared ACR `myssharedacr.azurecr.io`
  - Uses build arg `NEXT_PUBLIC_API_BASE_URL=https://api.cognitivemesh.neuralliquid.ai`
  - Deploys to Azure Web App production plus `staging` slot
  - Emits OCI source label from `${{ github.server_url }}/${{ github.repository }}`

## Packages And Containers

Local image and package names found:

- `cognitive-mesh-api`
- `cognitive-mesh-frontend`
- `cognitive-mesh-redis`
- `cognitive-mesh-qdrant`
- `cognitive-mesh-azurite`
- NuGet package references are managed by project files and `Directory.Packages.props`; no package ownership migration was performed.

GitHub package inventory:

- No Cognitive Mesh container packages were found under `phoenixvc`.
- Visible `phoenixvc` container packages are tied to `phoenixvc/docket` and `phoenixvc/sluice`:
  - `pvc-costops-analytics-ingestion` - private - `phoenixvc/docket`
  - `pvc-costops-analytics-advisor` - private - `phoenixvc/docket`
  - `pvc-costops-analytics-api` - private - `phoenixvc/docket`
  - `sluice-dashboard` - public - `phoenixvc/sluice`
  - `sluice-state-service` - public - `phoenixvc/sluice`
  - `sluice-dashboard-next` - public - `phoenixvc/sluice`
  - `docket-advisor` - public - `phoenixvc/docket`
  - `docket-ingestion` - public - `phoenixvc/docket`
  - `docket-api` - public - `phoenixvc/docket`

Azure registry inventory:

- A shared ACR exists: `myssharedacr`
  - Resource group: `mys-global-shared-rg`
  - Location: `southafricanorth`
  - Resource ID: `/subscriptions/bb4e3882-2079-4bab-8974-611bc0b8bb58/resourceGroups/mys-global-shared-rg/providers/Microsoft.ContainerRegistry/registries/myssharedacr`
  - Tags indicate shared infrastructure for Mystira, managed by Terraform.
- No `cognitivemeshacr` or Cognitive Mesh-specific ACR was found in the active subscription.
- User decision: use shared ACR `myssharedacr.azurecr.io` for new NeuralLiquid Cognitive Mesh deployments.

## Deployment Targets And Public URLs

Observed active deployment targets from workflow files:

- `https://staging.cognitivemesh.io`
- `https://cognitivemesh.io`
- `https://api.cognitivemesh.io`

Updated deployment decision:

- Do not treat the existing AKS workflow references as an in-place migration target.
- Do not use AKS for the initial deployment.
- Create new NeuralLiquid deployments.
- Use shared ACR `myssharedacr.azurecr.io` as the container registry target.
- Initial deployment scope is production only.
- `staging` is a production slot, not an independent long-lived staging environment.
- Target domain pattern for now:
  - `staging.cognitivemesh.neuralliquid.ai`
  - `cognitivemesh.neuralliquid.ai`
- Eliminate or disable expensive nonessential resources for the initial deployment.
- DNS is currently managed in Mystira workspace Terraform; this can be used as a temporary bridge, but NeuralLiquid-owned DNS/deployment state should move to NeuralLiquid-owned infrastructure before long-term production.

DNS checks on 2026-07-12:

- `cognitivemesh.io`: does not resolve
- `staging.cognitivemesh.io`: does not resolve
- `api.cognitivemesh.io`: does not resolve

Azure resource checks in subscription `bb4e3882-2079-4bab-8974-611bc0b8bb58`:

- No AKS clusters returned by `Microsoft.ContainerService/managedClusters` inventory.
- No resources or resource groups containing `cognitive`, `cognitivemesh`, or `cognitive-mesh` were found.
- One `mesh` DNS zone was found, `nexamesh.ai`, unrelated to Cognitive Mesh deployment.

Terraform prep completed on 2026-07-12:

- Expensive optional root-module resources now default to disabled: networking, monitoring, Key Vault, storage, Cosmos DB, Redis, Qdrant, dedicated Azure OpenAI, AI Search, legacy frontend hosting, and Web Apps.
- Prod Terragrunt explicitly enables only `enable_webapps = true`.
- Prod App Service plan SKU is `S1` because Azure Basic does not support deployment slots.
- Prod remote state backend was bootstrapped:
  - Resource group: `nl-cognitive-mesh-tfstate-rg`
  - Storage account: `nlcognitivemeshtfstate`
  - Container: `tfstate`
- Prod Terragrunt apply completed on 2026-07-12:
  - Resource group: `nl-prod-cognitive-mesh-rg`
  - App Service plan: `cognitive-mesh-apps-plan-prod` (`S1`)
  - API Web App: `cognitive-mesh-api-prod.azurewebsites.net`
  - API staging slot: `cognitive-mesh-api-prod-staging.azurewebsites.net`
  - Frontend Web App: `cognitive-mesh-frontend-prod.azurewebsites.net`
  - Frontend staging slot: `cognitive-mesh-frontend-prod-staging.azurewebsites.net`
  - AcrPull role assignments exist for both apps and both slots.
- Post-apply Terragrunt plan reports no changes.

Observed internal Kubernetes targets:

- `cognitive-mesh-api.cognitive-mesh-staging.svc.cluster.local:8080`
- `cognitive-mesh-api.cognitive-mesh-prod.svc.cluster.local:8080`
- `cognitive-mesh-frontend.cognitive-mesh-staging.svc.cluster.local:3000`
- `cognitive-mesh-frontend.cognitive-mesh-prod.svc.cluster.local:3000`
- Kubernetes namespaces: `cognitive-mesh-staging`, `cognitive-mesh-prod`

Observed local development services:

- API: `localhost:8080`
- Frontend: `localhost:3000`
- Storybook: `localhost:6006`
- Redis: `localhost:6379`
- Qdrant: `localhost:6333` and `localhost:6334`
- Azurite: `localhost:10000`, `localhost:10001`, `localhost:10002`

## Cloud Identity And Provider Configuration

Provider settings in `providersettings.json` reference environment variable names only:

- `AZURE_OPENAI_KEY`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_DEPLOYMENT_GPT35`
- `AZURE_OPENAI_DEPLOYMENT_ROUTER`
- `AZURE_OPENAI_KEY_SAF`
- `AZURE_OPENAI_ENDPOINT_SAF`
- `AZURE_OPENAI_DEPLOYMENT_4O`
- `AZURE_OPENAI_DEPLOYMENT_GPT41`
- `AZURE_OPENAI_DEPLOYMENT_EMBEDDINGS`

No Azure OpenAI endpoint values or keys were recorded.

Azure identity checks:

- Active Azure account: `jurie@phoenixvc.tech`
- Tenant ID: `9530cd32-9e33-47f0-9247-ed964730b580`
- Subscription ID: `bb4e3882-2079-4bab-8974-611bc0b8bb58`
- Checked candidate GitHub Actions app registrations:
  - `mys-dev-github-actions`: federated subject `repo:phoenixvc/mystira-workspace:environment:dev`
  - `mys-prod-github-actions`: federated subject `repo:phoenixvc/mystira-workspace:environment:prod`
  - `docket-github-actions`: federated subjects `repo:phoenixvc/docket:ref:refs/heads/main` and `repo:phoenixvc/docket:pull_request`
  - `phoenix-website-github-actions`: no federated credentials
  - `convolens-sp`: federated subject `repo:neuralliquid/convolens:environment:dev`
  - `hov-shared-deploy-sp`: no federated credentials
- Follow-up deployment prep created `nl-cognitive-mesh-github-actions` with federated subjects:
  - `repo:phoenixvc/cognitive-mesh:ref:refs/heads/dev`
  - `repo:phoenixvc/cognitive-mesh:ref:refs/heads/main`
  - `repo:phoenixvc/cognitive-mesh:environment:production`
- The app service principal has `AcrPush` on `myssharedacr` and `Website Contributor` on `nl-prod-cognitive-mesh-rg`.
- The only visible OpenAI/AOAI resource match is `pvc-prod-sluice-aoai` in `pvc-prod-sluice-rg`, tagged for `project=sluice` and `purpose=aoai`.

## Reference Inventory Summary

Current ownership statements:

- `README.md` says Cognitive Mesh is the intelligence and governance core of the `phoenixvc platform`.
- GitHub description says `Relaunching as neuralliquid.ai`.
- Repository topics include both `neuralliquid` and `phoenixvc`.

PhoenixVC-hosted dependencies to preserve and clarify:

- `sluice`
- `docket`
- `deck`
- `retort`
- `org-meta`
- `mystira-workspace`

Unknown reference:

- Resolved by user confirmation: the stale `phoenix-flow` entry should be `baton`.

Generated output requiring source-of-truth fixes before editing:

- `.github/pr-361-review-issues.json`
- `src/UILayer/web/src/lib/api/generated`

## Rollback Procedure Draft

No transfer was performed in this batch. If a future transfer is attempted and must be rolled back:

1. Stop CI/CD workflows that publish packages or deploy infrastructure.
2. Confirm the old `phoenixvc/cognitive-mesh` redirect and the new `neuralliquid/cognitive-mesh` repository ID.
3. Transfer the same repository back to `phoenixvc`, preserving repository ID and history.
4. Restore repository rulesets, environments, variables, secrets, deploy keys, webhooks, app installations, and package permissions from this snapshot plus GitHub settings exports.
5. Re-run a fresh clone, build, test, and one controlled deployment from the restored owner.

This rollback is incomplete until the blockers below are resolved.

## Blockers Before Transfer

- Batch 2 artifacts and routing Terraform changes are isolated into clean PR branches and must be reviewed/merged before transfer: migration package PR #512 and Terraform routing PR #513.
- Deployment workflows still need any approved local workflow/Terraform changes to be committed and pushed before GitHub Actions will use the new Web App deployment path.
- Old `cognitivemesh.io`, `staging.cognitivemesh.io`, and `api.cognitivemesh.io` do not resolve; replace with `*.cognitivemesh.neuralliquid.ai`.
- After repository transfer, add equivalent federated credential subjects for `neuralliquid/cognitive-mesh` to `nl-cognitive-mesh-github-actions` or a NeuralLiquid-owned replacement app registration.
- Selected-repository GitHub App coverage still needs confirmation for `cognitive-mesh`, especially Renovate, Stilla, Devin, and phoenixvc-actions-runner; API expansion returned 403 and requires OAuth `user` scope or manual org UI review.

## Resolved Or Narrowed Blockers

- `phoenix-flow` is resolved by user confirmation: use `baton` as the project tracker reference.
- Active Azure account, tenant, and subscription were identified.
- Shared ACR decision is resolved: use `myssharedacr` for the initial NeuralLiquid deployment.
- Initial deployment shape is resolved: production only, with `staging` treated as a production slot and `prod` as production.
- Domain direction is resolved for now: use `x.cognitivemesh.neuralliquid.ai`.
- AKS is resolved out of scope for the initial deployment; `AKS_CLUSTER_NAME` and `AKS_RESOURCE_GROUP` are not required.
- Production GitHub environment was created on `phoenixvc/cognitive-mesh`.
- Deploy workflows were rewritten to remove AKS/Kustomize/kubectl and ACR username/password secrets, push to `myssharedacr`, and deploy Azure Web App production plus `staging` slot.
- Terraform feature flags now default expensive optional resources to `false`; prod enables only the container Web Apps module.
- NeuralLiquid Terraform state backend was bootstrapped in Azure.
- Prod Terragrunt apply completed; final Terragrunt plan reports no changes.
- GitHub Actions variables were populated on `phoenixvc/cognitive-mesh`.
- GitHub Actions OIDC secrets were populated on `phoenixvc/cognitive-mesh`: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID`.
- Deploy workflow variable setup is resolved for the currently recorded PhoenixVC deployment path, but must be recreated or validated again after transfer to `neuralliquid/cognitive-mesh`.
- Terraform validation succeeds with AzureRM `4.80.0`.
- Sluice-owned AOAI resource `pvc-prod-sluice-aoai` was found, supporting the architecture boundary that Cognitive Mesh should route model calls through `sluice`.
- GitHub App installation inventory is now visible at org level; 40 installations were found.
- Selected app installation IDs are now known, but repository membership remains blocked by OAuth scope.
- GitHub package inventory is now visible; no Cognitive Mesh packages were found under `phoenixvc`.
- Organization Actions secrets are now visible; `AZURE_CREDENTIALS` exists at org scope, but deployment workflow ACR/AKS/Slack secret names do not.

## Validation Performed

- Cloned `https://github.com/phoenixvc/cognitive-mesh.git` to `C:/tmp/cognitive-mesh`.
- Fetched `origin` on 2026-07-13 and confirmed `origin/dev` at `5b76bf34389b0a82dcc546c2eb09d0494cb09e1e`.
- Confirmed local branch `agent/adaptive-balance-control-widget` at `5ba6d9d0e96611baed977cf9c439cb58a5a4d708` with uncommitted migration/Terraform work.
- Queried selected GitHub App installation metadata and captured installation IDs for Renovate, Stilla, Devin and phoenixvc-actions-runner.
- Retried `/user/installations/{installation_id}/repositories`; GitHub returned 403 and requested OAuth `user` scope.
- Read `AGENTS.md` and `CLAUDE.md`.
- Queried GitHub repository metadata, branches, releases, rulesets, environments, secrets, variables, hooks, deploy keys, deployments, Pages, and recent workflow runs.
- Checked direct `staging` and `production` GitHub environments; both returned 404.
- Checked GitHub token scopes after refresh and confirmed `admin:org`, `read:packages`, `repo`, and `gist`.
- Queried organization packages, organization Actions secrets, organization Actions variables, repository Actions secrets, and repository Actions variables.
- Queried Azure account, resources, ACR, AKS, AOAI, and candidate app registration federated credentials.
- Checked DNS resolution for the workflow public URLs.
- Searched local files for active owner, workflow, deployment, package, and Azure references.
- Created documentation and local workflow/Terraform changes. No repository transfer, archive, production app apply, deployment workflow run, package publication, or runtime app change was performed.
