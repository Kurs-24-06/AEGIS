provider "aws" {
  region = var.region

  # Default tags to apply to all resources
  default_tags {
    tags = {
      Project     = "AEGIS"
      Environment = terraform.workspace
      ManagedBy   = "Terraform"
    }
  }
}

# Use the shared state backend configuration
terraform {
  backend "s3" {
    bucket         = "aegis-terraform-state"
    key            = "aws/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "aegis-terraform-locks"
    encrypt        = true
  }
}