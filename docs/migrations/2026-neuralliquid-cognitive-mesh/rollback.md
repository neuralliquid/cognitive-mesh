# Rollback Plan - NeuralLiquid Cognitive Mesh Migration

Generated: 2026-07-13

Scope: `phoenixvc/cognitive-mesh` to `neuralliquid/cognitive-mesh`.

No repository transfer has been performed yet.

## Current Rollback State

- Repository still exists at `phoenixvc/cognitive-mesh`.
- Latest fetched `origin/dev` checked on 2026-07-14 is `792454d`.
- Batch 2 work is merged into `dev`; it includes the migration package, routing Terraform, Docket forwarding/auth settings, Sluice secret bridge durability, and OIDC readiness documentation.
- Production App Services remain in `nl-prod-cognitive-mesh-rg`.
- Deployment identity `nl-cognitive-mesh-github-actions` currently has PhoenixVC and NeuralLiquid repository federated subjects.
- Shared ACR remains `myssharedacr.azurecr.io`.
- CogMesh production infrastructure keeps `enable_openai = false`.
- Sluice is an external PhoenixVC-hosted dependency.
- Docket canonical endpoint is live at `https://docket.phoenixvc.tech`.

## If Pre-Transfer Changes Need Reversal

1. Stop any in-flight deploy workflows for Cognitive Mesh.
2. Revert only the affected migration-prep commits or PRs.
3. If changes are still local-only, discard or move only the Batch 2 migration/Terraform edits after confirming they are not user-owned work.
4. Re-run Terraform validation and a prod plan before applying any infrastructure rollback.
5. Confirm API and frontend health on the existing App Services.
6. Update `handoff.md`, `verification.md` and Baton with the rollback evidence.

## If A Future Repository Transfer Must Be Reversed

1. Stop workflows that publish packages, push images or deploy infrastructure.
2. Confirm the repository ID and both old/new GitHub URLs.
3. Transfer the same repository back to `phoenixvc`, preserving history and repository ID.
4. Restore or recreate:
   - branch rules and rulesets;
   - environments and approvals;
   - repository and environment variables;
   - secret names, never values in docs;
   - webhooks and deploy keys;
   - GitHub App repository selections;
   - package/container permissions.
5. Restore Azure OIDC federated subjects for the active repository owner.
6. Re-run a fresh clone from the restored owner.
7. Run build/test verification.
8. Run one controlled deployment from the restored repository owner.
9. Validate old/new GitHub redirects and public URLs.

## Stop Conditions

Stop rollback or transfer work if any of these remain unknown:

- a production deployment identity cannot be tied to a known repository subject;
- a selected GitHub App cannot be restored or inspected;
- a private downstream consumer depends on the old repository URL;
- a package or container registry path has unknown consumers;
- Docket is still referenced by old `shared-costops` service identity but claimed as canonical;
- any secret value would need to be copied into a file, log or prompt.
