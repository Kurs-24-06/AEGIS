# Common variables used across modules

variable "project" {
  description = "Project name"
  type        = string
  default     = "aegis"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "region" {
  description = "The region to deploy resources"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "version" {
  description = "Application version"
  type        = string
}

# Resource sizing variables with environment-specific defaults
variable "instance_sizes" {
  description = "Map of instance sizes for different environments"
  type        = map(map(string))
  default = {
    dev = {
      frontend = "small"
      backend  = "small"
      database = "small"
    }
    staging = {
      frontend = "medium"
      backend  = "medium"
      database = "medium"
    }
    prod = {
      frontend = "large"
      backend  = "large"
      database = "large"
    }
  }
}

# Networking variables
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "subnet_count" {
  description = "Number of subnets to create (usually matching availability zone count)"
  type        = number
  default     = 3
}