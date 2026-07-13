variable "project_name" {
  description = "Project name used in resource names."
  type        = string
}

variable "environment" {
  description = "Deployment environment."
  type        = string
}

variable "location" {
  description = "Azure region."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group name."
  type        = string
}

variable "shared_acr_name" {
  description = "Existing shared Azure Container Registry name."
  type        = string
}

variable "shared_acr_resource_group_name" {
  description = "Resource group containing the shared Azure Container Registry."
  type        = string
}

variable "app_service_plan_sku" {
  description = "App Service Plan SKU."
  type        = string
  default     = "B1"
}

variable "api_image_name" {
  description = "Initial API container image name, including tag."
  type        = string
}

variable "frontend_image_name" {
  description = "Initial frontend container image name, including tag."
  type        = string
}

variable "api_health_check_path" {
  description = "API health check path."
  type        = string
  default     = "/healthz"
}

variable "frontend_health_check_path" {
  description = "Frontend health check path."
  type        = string
  default     = "/api/health"
}

variable "health_check_eviction_time_in_min" {
  description = "Minutes of failed health checks before an instance is removed."
  type        = number
  default     = 10
}

variable "api_port" {
  description = "API container port."
  type        = number
  default     = 8080
}

variable "frontend_port" {
  description = "Frontend container port."
  type        = number
  default     = 3000
}

variable "api_base_url" {
  description = "Public API base URL used by the frontend."
  type        = string
}

variable "api_allowed_origins" {
  description = "Allowed browser origins for API CORS."
  type        = list(string)
  default     = []
}

variable "api_sluice_base_url" {
  description = "Sluice gateway base URL for Cognitive Mesh model egress. Leave empty until the production Sluice endpoint and API key secret URI are confirmed."
  type        = string
  default     = ""
}

variable "api_sluice_api_key_secret_uri" {
  description = "Key Vault secret URI for the Sluice API key. The App Service receives this as a Key Vault reference, not a raw secret value."
  type        = string
  default     = ""
}

variable "api_sluice_model" {
  description = "Logical Sluice model route used by Cognitive Mesh."
  type        = string
  default     = "default"
}

variable "api_sluice_max_tokens" {
  description = "Maximum output tokens Cognitive Mesh may request through Sluice."
  type        = number
  default     = 16384
}

variable "api_docket_base_url" {
  description = "Docket API base URL for model-usage attribution. Leave empty until the production Docket endpoint is confirmed."
  type        = string
  default     = ""
}

variable "frontend_mystira_auth_client_id" {
  description = "Public Entra application client ID used by the frontend for Mystira identity login."
  type        = string
  default     = ""
}

variable "frontend_mystira_tenant_id" {
  description = "Mystira Entra tenant ID used by the frontend for identity login."
  type        = string
  default     = ""
}

variable "common_tags" {
  description = "Common tags applied to resources."
  type        = map(string)
  default     = {}
}
