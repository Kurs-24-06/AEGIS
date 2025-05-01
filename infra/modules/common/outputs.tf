# Common output format to standardize across providers

output "environment_info" {
  description = "Information about the deployed environment"
  value = {
    project     = var.project
    environment = var.environment
    region      = var.region
    version     = var.version
  }
}

output "network_info" {
  description = "Information about the network configuration"
  value = {
    vpc_id    = module.vpc.vpc_id
    subnet_ids = module.vpc.subnet_ids
  }
}

output "endpoints" {
  description = "Endpoints for accessing services"
  value = {
    frontend_url = module.compute.frontend_url
    backend_url  = module.compute.backend_url
    monitoring_url = module.monitoring.grafana_url
  }
}