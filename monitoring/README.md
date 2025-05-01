# AEGIS Monitoring and Observability

This directory contains the configuration and setup for the AEGIS monitoring and observability stack.

## Components

The monitoring stack consists of:

1. **Prometheus**: Metrics collection and storage
2. **Grafana**: Visualization and dashboards
3. **AlertManager**: Alert routing and notifications
4. **Loki**: Log aggregation and querying
5. **Jaeger**: Distributed tracing
6. **Node Exporter**: Host metrics collection

## Setup

### Prerequisites

- Docker and Docker Compose
- Access to the hosts where the application runs

### Starting the Monitoring Stack

```bash
cd monitoring
docker-compose up -d
```
