data "azurerm_container_registry" "shared" {
  name                = var.shared_acr_name
  resource_group_name = var.shared_acr_resource_group_name
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

  app_settings = {
    ASPNETCORE_URLS                     = "http://+:${var.api_port}"
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
    WEBSITES_PORT                       = tostring(var.api_port)
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

  app_settings = {
    ASPNETCORE_URLS                     = "http://+:${var.api_port}"
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
    WEBSITES_PORT                       = tostring(var.api_port)
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

  app_settings = {
    NEXT_PUBLIC_API_BASE_URL            = var.api_base_url
    NODE_ENV                            = "production"
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
    WEBSITES_PORT                       = tostring(var.frontend_port)
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

  app_settings = {
    NEXT_PUBLIC_API_BASE_URL            = var.api_base_url
    NODE_ENV                            = "production"
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
    WEBSITES_PORT                       = tostring(var.frontend_port)
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
