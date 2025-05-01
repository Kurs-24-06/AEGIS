# AEGIS Deployment Guide

This guide explains how to deploy the AEGIS platform to different environments.

## Environments

AEGIS supports three environments:

1. **Development (dev)**: For development and testing new features
2. **Staging (staging)**: For pre-production testing and verification
3. **Production (prod)**: The live environment used by customers

Each environment has its own configuration in `environments/<env>/config.yml`.

## Deployment Process

### Standard Deployment

To deploy a specific version to an environment:

```bash
./deploy/scripts/deploy.sh --env [dev|staging|prod] --version [VERSION]
```
