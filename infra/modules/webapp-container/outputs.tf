output "app_service_plan_id" {
  description = "The App Service Plan ID."
  value       = azurerm_service_plan.this.id
}

output "api_app_service_name" {
  description = "The API App Service name."
  value       = azurerm_linux_web_app.api.name
}

output "api_app_service_id" {
  description = "The API App Service ID."
  value       = azurerm_linux_web_app.api.id
}

output "api_default_hostname" {
  description = "The API App Service default hostname."
  value       = azurerm_linux_web_app.api.default_hostname
}

output "api_staging_slot_name" {
  description = "The API staging slot name."
  value       = azurerm_linux_web_app_slot.api_staging.name
}

output "frontend_app_service_name" {
  description = "The frontend App Service name."
  value       = azurerm_linux_web_app.frontend.name
}

output "frontend_app_service_id" {
  description = "The frontend App Service ID."
  value       = azurerm_linux_web_app.frontend.id
}

output "frontend_default_hostname" {
  description = "The frontend App Service default hostname."
  value       = azurerm_linux_web_app.frontend.default_hostname
}

output "frontend_staging_slot_name" {
  description = "The frontend staging slot name."
  value       = azurerm_linux_web_app_slot.frontend_staging.name
}
