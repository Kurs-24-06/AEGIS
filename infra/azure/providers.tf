provider "azurerm" {
  features {}

  # Default tags to apply to all resources
  tags = {
    Project     = "AEGIS"
    Environment = terraform.workspace
    ManagedBy   = "Terraform"
  }
}

# Use the shared state backend configuration
terraform {
  backend "azurerm" {
    resource_group_name  = "aegis-terraform-state"
    storage_account_name = "aegisterraformstate"
    container_name       = "tfstate"
    key                  = "azure/terraform.tfstate"
  }
}