###############################################################################
# Cognitive Mesh — Root Module
# Orchestrates all infrastructure sub-modules.
###############################################################################

locals {
  tags = merge(var.common_tags, {
    Environment = var.environment
  })
}

# ---------- Resource Group ----------

resource "azurerm_resource_group" "this" {
  name     = var.resource_group_name
  location = var.location

  tags = local.tags
}

# ---------- Networking ----------

module "networking" {
  count  = var.enable_networking ? 1 : 0
  source = "./modules/networking"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  vnet_address_space  = var.vnet_address_space
  common_tags         = local.tags
}

# ---------- Monitoring (deploy early — other modules reference Log Analytics) ----------

module "monitoring" {
  count  = var.enable_monitoring ? 1 : 0
  source = "./modules/monitoring"

  project_name               = var.project_name
  environment                = var.environment
  location                   = var.location
  resource_group_name        = azurerm_resource_group.this.name
  retention_in_days          = var.log_retention_days
  appinsights_retention_days = var.appinsights_retention_days
  common_tags                = local.tags
}

# ---------- Key Vault ----------

module "keyvault" {
  count  = var.enable_keyvault ? 1 : 0
  source = "./modules/keyvault"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  common_tags         = local.tags
}

# ---------- Storage ----------

module "storage" {
  count  = var.enable_storage ? 1 : 0
  source = "./modules/storage"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  common_tags         = local.tags
}

# ---------- CosmosDB ----------

module "cosmosdb" {
  count  = var.enable_cosmosdb ? 1 : 0
  source = "./modules/cosmosdb"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  database_name       = var.cosmosdb_database_name
  consistency_level   = var.cosmosdb_consistency_level
  common_tags         = local.tags
}

# ---------- Redis ----------

module "redis" {
  count  = var.enable_redis ? 1 : 0
  source = "./modules/redis"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  prod_sku_name       = var.redis_prod_sku_name
  prod_capacity       = var.redis_prod_capacity
  common_tags         = local.tags
}

# ---------- Qdrant (Vector DB) ----------

module "qdrant" {
  count  = var.enable_qdrant && var.enable_networking ? 1 : 0
  source = "./modules/qdrant"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  qdrant_image        = var.qdrant_image
  cpu_cores           = var.qdrant_cpu_cores
  memory_gb           = var.qdrant_memory_gb
  subnet_ids          = [module.networking[0].subnet_ids["containers"]]
  ip_address_type     = "Private"
  common_tags         = local.tags
}

# ---------- Azure OpenAI ----------

module "openai" {
  count  = var.enable_openai ? 1 : 0
  source = "./modules/openai"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  model_deployments   = var.openai_model_deployments
  common_tags         = local.tags
}

# ---------- AI Search ----------

module "ai_search" {
  count  = var.enable_ai_search ? 1 : 0
  source = "./modules/ai-search"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  sku                 = var.search_sku
  common_tags         = local.tags
}

# ---------- Frontend Hosting ----------

module "frontend_hosting" {
  count  = var.enable_legacy_frontend_hosting && var.enable_networking ? 1 : 0
  source = "./modules/frontend-hosting"

  project_name         = var.project_name
  environment          = var.environment
  location             = var.location
  resource_group_name  = azurerm_resource_group.this.name
  api_base_url         = var.frontend_api_base_url
  app_service_plan_sku = var.frontend_app_service_plan_sku
  custom_domain        = var.frontend_custom_domain
  subnet_id            = var.enable_private_endpoints ? module.networking[0].subnet_ids["app"] : null
  common_tags          = local.tags
}

# ---------- Container Web Apps ----------

module "webapps" {
  count  = var.enable_webapps ? 1 : 0
  source = "./modules/webapp-container"

  project_name                    = var.project_name
  environment                     = var.environment
  location                        = var.location
  resource_group_name             = azurerm_resource_group.this.name
  shared_acr_name                 = var.shared_acr_name
  shared_acr_resource_group_name  = var.shared_acr_resource_group_name
  app_service_plan_sku            = var.webapp_service_plan_sku
  api_image_name                  = var.api_container_image
  frontend_image_name             = var.frontend_container_image
  api_base_url                    = var.api_public_base_url
  api_allowed_origins             = var.api_allowed_origins
  api_sluice_base_url             = var.api_sluice_base_url
  api_sluice_api_key_secret_uri   = var.api_sluice_api_key_secret_uri
  api_sluice_model                = var.api_sluice_model
  api_sluice_max_tokens           = var.api_sluice_max_tokens
  api_docket_base_url             = var.api_docket_base_url
  frontend_mystira_auth_client_id = var.frontend_mystira_auth_client_id
  frontend_mystira_tenant_id      = var.frontend_mystira_tenant_id
  common_tags                     = local.tags
}

# ---------- Store secrets in Key Vault ----------

resource "azurerm_key_vault_secret" "cosmosdb_connection" {
  count        = var.enable_keyvault && var.enable_cosmosdb ? 1 : 0
  name         = "cosmosdb-connection-string"
  value        = module.cosmosdb[0].connection_strings[0]
  key_vault_id = module.keyvault[0].key_vault_id

  depends_on = [module.keyvault]
}

resource "azurerm_key_vault_secret" "redis_connection" {
  count        = var.enable_keyvault && var.enable_redis ? 1 : 0
  name         = "redis-connection-string"
  value        = module.redis[0].primary_connection_string
  key_vault_id = module.keyvault[0].key_vault_id

  depends_on = [module.keyvault]
}

resource "azurerm_key_vault_secret" "storage_connection" {
  count        = var.enable_keyvault && var.enable_storage ? 1 : 0
  name         = "storage-connection-string"
  value        = module.storage[0].primary_connection_string
  key_vault_id = module.keyvault[0].key_vault_id

  depends_on = [module.keyvault]
}

resource "azurerm_key_vault_secret" "openai_key" {
  count        = var.enable_keyvault && var.enable_openai ? 1 : 0
  name         = "openai-api-key"
  value        = module.openai[0].primary_access_key
  key_vault_id = module.keyvault[0].key_vault_id

  depends_on = [module.keyvault]
}

resource "azurerm_key_vault_secret" "appinsights_connection" {
  count        = var.enable_keyvault && var.enable_monitoring ? 1 : 0
  name         = "appinsights-connection-string"
  value        = module.monitoring[0].application_insights_connection_string
  key_vault_id = module.keyvault[0].key_vault_id

  depends_on = [module.keyvault]
}

resource "azurerm_key_vault_secret" "search_key" {
  count        = var.enable_keyvault && var.enable_ai_search ? 1 : 0
  name         = "search-admin-key"
  value        = module.ai_search[0].primary_key
  key_vault_id = module.keyvault[0].key_vault_id

  depends_on = [module.keyvault]
}
