data "azurerm_container_registry" "shared" {
  name                = var.shared_acr_name
  resource_group_name = var.shared_acr_resource_group_name
}

locals {
  api_cors_app_settings = {
    for index, origin in var.api_allowed_origins :
    "Cors__AllowedOrigins__${index}" => origin
  }

  api_required_routing_app_settings = {
    ALLOW_DIRECT_MODEL_PROVIDER = "false"
  }

  api_sluice_secret_app_settings = var.api_sluice_api_key_secret_uri == "" ? {} : {
    SLUICE_API_KEY = "@Microsoft.KeyVault(SecretUri=${var.api_sluice_api_key_secret_uri})"
  }

  api_sluice_app_settings = var.api_sluice_base_url == "" ? {} : merge({
    SLUICE_BASE_URL   = var.api_sluice_base_url
    SLUICE_MODEL      = var.api_sluice_model
    SLUICE_MAX_TOKENS = tostring(var.api_sluice_max_tokens)
    },
    local.api_sluice_secret_app_settings
  )

  api_docket_scope_app_settings = (
    var.api_docket_scope != "" ? {
      DOCKET_SCOPE = var.api_docket_scope
      } : var.api_docket_audience != "" ? {
      DOCKET_AUDIENCE = var.api_docket_audience
    } : {}
  )

  api_docket_secret_app_settings = var.api_docket_api_key_secret_uri == "" ? {} : {
    DOCKET_API_KEY = "@Microsoft.KeyVault(SecretUri=${var.api_docket_api_key_secret_uri})"
  }

  api_docket_app_settings = var.api_docket_base_url == "" ? {} : merge({
    DOCKET_BASE_URL = var.api_docket_base_url
  }, local.api_docket_scope_app_settings, local.api_docket_secret_app_settings)

  api_optional_routing_app_settings = merge(local.api_sluice_app_settings, local.api_docket_app_settings)

  frontend_oidc_secret_app_settings = var.frontend_mystira_oidc_client_secret_secret_uri == "" ? {} : {
    MYSTIRA_OIDC_CLIENT_SECRET = "@Microsoft.KeyVault(SecretUri=${var.frontend_mystira_oidc_client_secret_secret_uri})"
  }

  frontend_app_settings = merge({
    NEXT_PUBLIC_API_BASE_URL            = var.api_base_url
    NEXT_PUBLIC_MYSTIRA_AUTH_CLIENT_ID  = var.frontend_mystira_auth_client_id
    NEXT_PUBLIC_MYSTIRA_TENANT_ID       = var.frontend_mystira_tenant_id
    NEXT_PUBLIC_SHOW_PREVIEW_NAV        = tostring(var.frontend_show_preview_nav)
    MYSTIRA_IDENTITY_BASE_URL           = var.frontend_mystira_identity_base_url
    MYSTIRA_OIDC_CLIENT_ID              = var.frontend_mystira_oidc_client_id
    NODE_ENV                            = "production"
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
    WEBSITES_PORT                       = tostring(var.frontend_port)
  }, local.frontend_oidc_secret_app_settings)
}

resource "azurerm_service_plan" "this" {
  name                = "${var.project_name}-apps-plan-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  os_type             = "Linux"
  sku_name            = var.app_service_plan_sku

  tags = merge(var.common_tags, {
    Module = "webapp-container"
  })
}

resource "azurerm_linux_web_app" "api" {
  name                = "${var.project_name}-api-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  service_plan_id     = azurerm_service_plan.this.id
  https_only          = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on                               = false
    health_check_eviction_time_in_min       = var.health_check_eviction_time_in_min
    health_check_path                       = var.api_health_check_path
    container_registry_use_managed_identity = true

    application_stack {
      docker_image_name   = var.api_image_name
      docker_registry_url = "https://${data.azurerm_container_registry.shared.login_server}"
    }
  }

  app_settings = merge({
    ASPNETCORE_URLS                     = "http://+:${var.api_port}"
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
    WEBSITES_PORT                       = tostring(var.api_port)
  }, local.api_cors_app_settings, local.api_required_routing_app_settings, local.api_optional_routing_app_settings)

  lifecycle {
    ignore_changes = [
      app_settings["DOCKET_API_KEY"]
    ]
  }

  tags = merge(var.common_tags, {
    Module = "webapp-container"
    Role   = "api"
  })
}

resource "azurerm_linux_web_app_slot" "api_staging" {
  name           = "staging"
  app_service_id = azurerm_linux_web_app.api.id
  https_only     = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on                               = false
    health_check_eviction_time_in_min       = var.health_check_eviction_time_in_min
    health_check_path                       = var.api_health_check_path
    container_registry_use_managed_identity = true

    application_stack {
      docker_image_name   = var.api_image_name
      docker_registry_url = "https://${data.azurerm_container_registry.shared.login_server}"
    }
  }

  app_settings = merge({
    ASPNETCORE_URLS                     = "http://+:${var.api_port}"
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
    WEBSITES_PORT                       = tostring(var.api_port)
  }, local.api_cors_app_settings, local.api_required_routing_app_settings, local.api_optional_routing_app_settings)

  lifecycle {
    ignore_changes = [
      app_settings["DOCKET_API_KEY"]
    ]
  }

  tags = merge(var.common_tags, {
    Module = "webapp-container"
    Role   = "api-staging-slot"
  })
}

resource "azurerm_linux_web_app" "frontend" {
  name                = "${var.project_name}-frontend-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  service_plan_id     = azurerm_service_plan.this.id
  https_only          = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on                               = false
    health_check_eviction_time_in_min       = var.health_check_eviction_time_in_min
    health_check_path                       = var.frontend_health_check_path
    container_registry_use_managed_identity = true

    application_stack {
      docker_image_name   = var.frontend_image_name
      docker_registry_url = "https://${data.azurerm_container_registry.shared.login_server}"
    }
  }

  app_settings = local.frontend_app_settings

  lifecycle {
    ignore_changes = [
      app_settings["MYSTIRA_OIDC_CLIENT_SECRET"]
    ]
  }

  tags = merge(var.common_tags, {
    Module = "webapp-container"
    Role   = "frontend"
  })
}

resource "azurerm_linux_web_app_slot" "frontend_staging" {
  name           = "staging"
  app_service_id = azurerm_linux_web_app.frontend.id
  https_only     = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on                               = false
    health_check_eviction_time_in_min       = var.health_check_eviction_time_in_min
    health_check_path                       = var.frontend_health_check_path
    container_registry_use_managed_identity = true

    application_stack {
      docker_image_name   = var.frontend_image_name
      docker_registry_url = "https://${data.azurerm_container_registry.shared.login_server}"
    }
  }

  app_settings = local.frontend_app_settings

  lifecycle {
    ignore_changes = [
      app_settings["MYSTIRA_OIDC_CLIENT_SECRET"]
    ]
  }

  tags = merge(var.common_tags, {
    Module = "webapp-container"
    Role   = "frontend-staging-slot"
  })
}

resource "azurerm_role_assignment" "api_acr_pull" {
  scope                = data.azurerm_container_registry.shared.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_linux_web_app.api.identity[0].principal_id
}

resource "azurerm_role_assignment" "api_staging_acr_pull" {
  scope                = data.azurerm_container_registry.shared.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_linux_web_app_slot.api_staging.identity[0].principal_id
}

resource "azurerm_role_assignment" "frontend_acr_pull" {
  scope                = data.azurerm_container_registry.shared.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_linux_web_app.frontend.identity[0].principal_id
}

resource "azurerm_role_assignment" "frontend_staging_acr_pull" {
  scope                = data.azurerm_container_registry.shared.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_linux_web_app_slot.frontend_staging.identity[0].principal_id
}
