###############################################################################
# Cognitive Mesh — Root Module Outputs
###############################################################################

# ---------- Resource Group ----------

output "resource_group_name" {
  description = "The name of the resource group."
  value       = azurerm_resource_group.this.name
}

output "resource_group_id" {
  description = "The ID of the resource group."
  value       = azurerm_resource_group.this.id
}

# ---------- Networking ----------

output "vnet_id" {
  description = "The ID of the virtual network."
  value       = try(module.networking[0].vnet_id, null)
}

output "subnet_ids" {
  description = "Map of subnet names to their IDs."
  value       = try(module.networking[0].subnet_ids, null)
}

# ---------- CosmosDB ----------

output "cosmosdb_endpoint" {
  description = "The Cosmos DB account endpoint."
  value       = try(module.cosmosdb[0].account_endpoint, null)
}

output "cosmosdb_database_name" {
  description = "The Cosmos DB database name."
  value       = try(module.cosmosdb[0].database_name, null)
}

# ---------- Storage ----------

output "storage_account_name" {
  description = "The storage account name."
  value       = try(module.storage[0].storage_account_name, null)
}

output "storage_blob_endpoint" {
  description = "The primary blob endpoint."
  value       = try(module.storage[0].primary_blob_endpoint, null)
}

# ---------- Redis ----------

output "redis_hostname" {
  description = "The Redis cache hostname."
  value       = try(module.redis[0].hostname, null)
}

output "redis_ssl_port" {
  description = "The Redis cache SSL port."
  value       = try(module.redis[0].ssl_port, null)
}

# ---------- Qdrant ----------

output "qdrant_http_endpoint" {
  description = "The Qdrant REST API endpoint."
  value       = try(module.qdrant[0].http_endpoint, null)
}

output "qdrant_grpc_endpoint" {
  description = "The Qdrant gRPC endpoint."
  value       = try(module.qdrant[0].grpc_endpoint, null)
}

# ---------- Azure OpenAI ----------

output "openai_endpoint" {
  description = "The Azure OpenAI endpoint."
  value       = try(module.openai[0].endpoint, null)
}

output "openai_deployment_ids" {
  description = "Map of OpenAI deployment names to IDs."
  value       = try(module.openai[0].deployment_ids, null)
}

# ---------- AI Search ----------

output "search_service_name" {
  description = "The AI Search service name."
  value       = try(module.ai_search[0].search_service_name, null)
}

# ---------- Key Vault ----------

output "key_vault_uri" {
  description = "The Key Vault URI."
  value       = try(module.keyvault[0].key_vault_uri, null)
}

output "key_vault_name" {
  description = "The Key Vault name."
  value       = try(module.keyvault[0].key_vault_name, null)
}

output "command_nexus_operator_secret_uri" {
  description = "The Key Vault secret URI used by the API for Command Nexus operator authentication. The secret value is written by CI."
  value       = local.command_nexus_operator_secret_uri == "" ? null : local.command_nexus_operator_secret_uri
}

# ---------- Monitoring ----------

output "application_insights_connection_string" {
  description = "The Application Insights connection string."
  value       = try(module.monitoring[0].application_insights_connection_string, null)
  sensitive   = true
}

output "application_insights_instrumentation_key" {
  description = "The Application Insights instrumentation key."
  value       = try(module.monitoring[0].application_insights_instrumentation_key, null)
  sensitive   = true
}

output "log_analytics_workspace_id" {
  description = "The Log Analytics Workspace ID."
  value       = try(module.monitoring[0].log_analytics_workspace_id, null)
}

# ---------- Frontend Hosting ----------

output "frontend_app_service_url" {
  description = "The default URL of the frontend App Service."
  value       = try(module.frontend_hosting[0].app_service_url, "https://${module.webapps[0].frontend_default_hostname}", null)
}

output "frontend_app_service_id" {
  description = "The ID of the frontend App Service."
  value       = try(module.frontend_hosting[0].app_service_id, module.webapps[0].frontend_app_service_id, null)
}

output "frontend_app_service_name" {
  description = "The name of the frontend App Service."
  value       = try(module.frontend_hosting[0].app_service_name, module.webapps[0].frontend_app_service_name, null)
}

# ---------- Container Web Apps ----------

output "api_app_service_name" {
  description = "The API App Service name."
  value       = try(module.webapps[0].api_app_service_name, null)
}

output "api_app_service_id" {
  description = "The API App Service ID."
  value       = try(module.webapps[0].api_app_service_id, null)
}

output "api_default_hostname" {
  description = "The API App Service default hostname."
  value       = try(module.webapps[0].api_default_hostname, null)
}

output "api_staging_slot_name" {
  description = "The API staging slot name."
  value       = try(module.webapps[0].api_staging_slot_name, null)
}

output "frontend_default_hostname" {
  description = "The frontend App Service default hostname."
  value       = try(module.webapps[0].frontend_default_hostname, null)
}

output "frontend_staging_slot_name" {
  description = "The frontend staging slot name."
  value       = try(module.webapps[0].frontend_staging_slot_name, null)
}
