###############################################################################
# Cognitive Mesh — Root Module Variables
###############################################################################

# ---------- General ----------

variable "project_name" {
  description = "Name of the project, used as a prefix for all resource names."
  type        = string
  default     = "cognitive-mesh"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)."
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "location" {
  description = "Primary Azure region for resource deployment."
  type        = string
  default     = "westeurope"
}

variable "resource_group_name" {
  description = "Name of the resource group to deploy all resources into."
  type        = string
}

variable "common_tags" {
  description = "Common tags applied to all resources."
  type        = map(string)
  default = {
    Project   = "CognitiveMesh"
    ManagedBy = "terraform"
  }
}

# ---------- Feature Flags ----------

variable "enable_networking" {
  description = "Whether to deploy the virtual network module."
  type        = bool
  default     = false
}

variable "enable_monitoring" {
  description = "Whether to deploy Log Analytics and Application Insights."
  type        = bool
  default     = false
}

variable "enable_keyvault" {
  description = "Whether to deploy Key Vault and write generated secrets."
  type        = bool
  default     = false
}

variable "enable_storage" {
  description = "Whether to deploy the storage module."
  type        = bool
  default     = false
}

variable "enable_cosmosdb" {
  description = "Whether to deploy Cosmos DB."
  type        = bool
  default     = false
}

variable "enable_redis" {
  description = "Whether to deploy Azure Cache for Redis."
  type        = bool
  default     = false
}

variable "enable_qdrant" {
  description = "Whether to deploy Qdrant on Azure Container Instances."
  type        = bool
  default     = false
}

variable "enable_openai" {
  description = "Whether to deploy a dedicated Azure OpenAI resource."
  type        = bool
  default     = false
}

variable "enable_ai_search" {
  description = "Whether to deploy Azure AI Search."
  type        = bool
  default     = false
}

variable "enable_legacy_frontend_hosting" {
  description = "Whether to deploy the legacy Node App Service frontend module."
  type        = bool
  default     = false
}

variable "enable_webapps" {
  description = "Whether to deploy containerized API and frontend Web Apps."
  type        = bool
  default     = false
}

# ---------- CosmosDB ----------

variable "cosmosdb_consistency_level" {
  description = "Consistency level for the Cosmos DB account."
  type        = string
  default     = "Session"
}

variable "cosmosdb_database_name" {
  description = "Name of the Cosmos DB SQL database."
  type        = string
  default     = "cognitive-mesh-db"
}

# ---------- Redis ----------

variable "redis_prod_sku_name" {
  description = "Redis SKU for staging/prod environments."
  type        = string
  default     = "Standard"
}

variable "redis_prod_capacity" {
  description = "Redis capacity for staging/prod environments."
  type        = number
  default     = 1
}

# ---------- Qdrant ----------

variable "qdrant_cpu_cores" {
  description = "CPU cores for the Qdrant container."
  type        = number
  default     = 1
}

variable "qdrant_memory_gb" {
  description = "Memory in GB for the Qdrant container."
  type        = number
  default     = 2
}

variable "qdrant_image" {
  description = "Docker image for Qdrant."
  type        = string
  default     = "qdrant/qdrant:v1.12.5"
}

# ---------- OpenAI ----------

variable "openai_model_deployments" {
  description = "Map of Azure OpenAI model deployments."
  type = map(object({
    model_name    = string
    model_version = string
    sku_name      = optional(string, "Standard")
    sku_capacity  = optional(number, 10)
  }))
  default = {
    "gpt-4o" = {
      model_name    = "gpt-4o"
      model_version = "2024-11-20"
      sku_name      = "GlobalStandard"
      sku_capacity  = 10
    }
    "text-embedding-3-large" = {
      model_name    = "text-embedding-3-large"
      model_version = "1"
      sku_name      = "Standard"
      sku_capacity  = 10
    }
  }
}

# ---------- AI Search ----------

variable "search_sku" {
  description = "SKU tier for Azure AI Search."
  type        = string
  default     = "basic"
}

# ---------- Monitoring ----------

variable "log_retention_days" {
  description = "Log Analytics data retention in days."
  type        = number
  default     = 30
}

variable "appinsights_retention_days" {
  description = "Application Insights data retention in days."
  type        = number
  default     = 90
}

# ---------- Frontend Hosting ----------

variable "frontend_api_base_url" {
  description = "Base URL for the backend API, consumed by the Next.js frontend."
  type        = string
  default     = "https://cognitive-mesh-api.azurewebsites.net"
}

variable "frontend_app_service_plan_sku" {
  description = "App Service Plan SKU for the frontend (B1 for dev, S1 for prod)."
  type        = string
  default     = "B1"
}

variable "frontend_custom_domain" {
  description = "Custom domain for the frontend App Service. Set to null to skip."
  type        = string
  default     = null
}

# ---------- Container Web Apps ----------

variable "shared_acr_name" {
  description = "Existing shared Azure Container Registry name."
  type        = string
  default     = "myssharedacr"
}

variable "shared_acr_resource_group_name" {
  description = "Resource group containing the shared Azure Container Registry."
  type        = string
  default     = "mys-global-shared-rg"
}

variable "webapp_service_plan_sku" {
  description = "App Service Plan SKU for containerized Web Apps."
  type        = string
  default     = "B1"
}

variable "api_container_image" {
  description = "Initial API container image name, including tag."
  type        = string
  default     = "cognitive-mesh-api:latest"
}

variable "frontend_container_image" {
  description = "Initial frontend container image name, including tag."
  type        = string
  default     = "cognitive-mesh-frontend:latest"
}

variable "api_public_base_url" {
  description = "Public API base URL."
  type        = string
  default     = "https://api.cognitivemesh.neuralliquid.ai"
}

# ---------- Networking ----------

variable "vnet_address_space" {
  description = "Address space for the virtual network."
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "enable_private_endpoints" {
  description = "Whether to create private endpoints for services."
  type        = bool
  default     = false
}
