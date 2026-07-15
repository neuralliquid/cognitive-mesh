###############################################################################
# Cognitive Mesh - Public DNS Records
###############################################################################

locals {
  public_dns_cname_records = {
    "cognitive-mesh" = {
      ttl    = 300
      record = var.public_dns_frontend_target_hostname
    }
    "control.cognitive-mesh" = {
      ttl    = 300
      record = var.public_dns_frontend_target_hostname
    }
    "api.cognitivemesh" = {
      ttl    = 300
      record = var.public_dns_api_target_hostname
    }
  }

  public_dns_app_service_verification_records = {
    "asuid.cognitive-mesh" = {
      ttl = 300
    }
    "asuid.control.cognitive-mesh" = {
      ttl = 3600
    }
    "asuid.api.cognitivemesh" = {
      ttl = 300
    }
  }
}

resource "azurerm_dns_cname_record" "public_app" {
  for_each = var.enable_public_dns_records ? local.public_dns_cname_records : {}

  name                = each.key
  zone_name           = var.public_dns_zone_name
  resource_group_name = var.public_dns_zone_resource_group_name
  ttl                 = each.value.ttl
  record              = each.value.record
}

resource "azurerm_dns_txt_record" "public_app_verification" {
  for_each = var.enable_public_dns_records ? local.public_dns_app_service_verification_records : {}

  name                = each.key
  zone_name           = var.public_dns_zone_name
  resource_group_name = var.public_dns_zone_resource_group_name
  ttl                 = each.value.ttl

  record {
    value = var.public_dns_app_service_verification_id
  }
}
