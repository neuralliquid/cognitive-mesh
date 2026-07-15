###############################################################################
# Cognitive Mesh — Terraform Backend Configuration
# State is stored in Azure Blob Storage.
###############################################################################

terraform {
  backend "azurerm" {
    resource_group_name  = "nl-cognitive-mesh-tfstate-rg"
    storage_account_name = "nlcognitivemeshtfstate"
    container_name       = "tfstate"
    key                  = "cognitive-mesh.tfstate"
  }
}
