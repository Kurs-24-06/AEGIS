output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "The name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "The endpoint for the EKS Kubernetes API"
  value       = module.eks.cluster_endpoint
}

output "simulation_endpoint" {
  description = "The endpoint to access the AEGIS simulation environment"
  value       = module.simulation.endpoint
}

# Additional outputs as needed...