# AEGIS Infrastructure as Code

This directory contains Terraform configurations for deploying the AEGIS infrastructure across multiple cloud providers and environments.

## Structure

infra/
├── modules/ # Reusable Terraform modules
│ ├── aws/ # AWS-specific modules
│ ├── azure/ # Azure-specific modules
│ └── common/ # Common variables and outputs
├── environments/ # Environment-specific configurations
│ ├── dev/ # Development environment
│ ├── staging/ # Staging environment
│ └── prod/ # Production environment
└── setup-terraform-backend.sh # Script to set up Terraform backend

## Getting Started

### Prerequisites

- Terraform v1.5.0+
- AWS CLI configured with appropriate permissions
- Azure CLI configured with appropriate permissions

### Setting Up Terraform Backend

Before applying any Terraform configurations, you need to set up the Terraform backend:

```bash
# For AWS
./setup-terraform-backend.sh --region eu-central-1

# For Azure (uses the same S3 backend for consistency)
./setup-terraform-backend.sh --region eu-central-1
```
