###############################################################################
# Cognitive Mesh - Prod Environment Terragrunt Configuration
###############################################################################

include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "${get_parent_terragrunt_dir()}//"
}

inputs = {
  environment         = "prod"
  location            = "southafricanorth"
  resource_group_name = "nl-prod-cognitive-mesh-rg"

  enable_networking              = false
  enable_monitoring              = false
  enable_keyvault                = false
  enable_storage                 = false
  enable_cosmosdb                = false
  enable_redis                   = false
  enable_qdrant                  = false
  enable_openai                  = false
  enable_ai_search               = false
  enable_legacy_frontend_hosting = false
  enable_webapps                 = true

  shared_acr_name                = "myssharedacr"
  shared_acr_resource_group_name = "mys-global-shared-rg"

  webapp_service_plan_sku                        = "S1"
  api_container_image                            = "cognitive-mesh-api:sha-5e0567a"
  frontend_container_image                       = "cognitive-mesh-frontend:sha-5e0567a"
  api_public_base_url                            = "https://api.cognitivemesh.neuralliquid.ai"
  api_sluice_base_url                            = get_env("COGMESH_SLUICE_BASE_URL", "")
  api_sluice_api_key_secret_uri                  = get_env("COGMESH_SLUICE_API_KEY_SECRET_URI", "")
  api_sluice_model                               = "default"
  api_sluice_max_tokens                          = 16384
  api_docket_base_url                            = get_env("COGMESH_DOCKET_BASE_URL", "")
  api_docket_audience                            = get_env("COGMESH_DOCKET_AUDIENCE", "")
  api_docket_scope                               = get_env("COGMESH_DOCKET_SCOPE", "")
  api_docket_api_key_secret_uri                  = get_env("COGMESH_DOCKET_API_KEY_SECRET_URI", "")
  frontend_mystira_auth_client_id                = "d8182e32-4dda-4fc9-83bf-b5d517bc9528"
  frontend_mystira_tenant_id                     = "9530cd32-9e33-47f0-9247-ed964730b580"
  frontend_show_preview_nav                      = true
  frontend_mystira_identity_base_url             = "https://identity.mystira.app"
  frontend_mystira_oidc_client_id                = "neuralliquid-cognitive-mesh-web"
  frontend_mystira_oidc_client_secret_secret_uri = get_env("COGMESH_FRONTEND_MYSTIRA_OIDC_CLIENT_SECRET_SECRET_URI", "")
  api_allowed_origins = [
    "https://cognitive-mesh-frontend-prod.azurewebsites.net",
    "https://cognitive-mesh-frontend-prod-staging.azurewebsites.net",
    "https://cognitive-mesh.neuralliquid.ai",
    "https://control.cognitive-mesh.neuralliquid.ai",
    "https://cognitivemesh.neuralliquid.ai",
    "https://app.cognitivemesh.neuralliquid.ai",
    "https://frontend.cognitivemesh.neuralliquid.ai",
    "https://staging.cognitivemesh.neuralliquid.ai",
  ]

  common_tags = {
    Project     = "CognitiveMesh"
    Environment = "prod"
    ManagedBy   = "terraform"
    Owner       = "NeuralLiquid"
  }
}
