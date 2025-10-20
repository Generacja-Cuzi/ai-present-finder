# Deployment Documentation

This directory contains all deployment-related documentation for the AI Present Finder application.

## Documents

- **[coolify-deployment.md](./coolify-deployment.md)** - Complete guide for deploying to Coolify
- **[docker-compose-production.md](./docker-compose-production.md)** - Docker Compose production configuration details
- **[architecture.md](./architecture.md)** - Production architecture overview
- **[troubleshooting.md](./troubleshooting.md)** - Common issues and solutions

## Quick Start

For a quick deployment to Coolify:

1. Read the [Coolify Deployment Guide](./coolify-deployment.md)
2. Set up required environment variables
3. Deploy `deployment/docker-compose.prod.yml`
4. Assign domains and deploy

## Production Architecture

The production setup uses:

- **Single application container** running all microservices via PM2
- **Single PostgreSQL instance** with multiple databases
- **RabbitMQ** for message queuing
- **Frontend** served by Nginx

See [architecture.md](./architecture.md) for detailed architecture documentation.

## Deployment Files

All deployment files are located in the `deployment/` directory:

- `deployment/docker-compose.prod.yml` - Production Docker Compose
- `deployment/Dockerfile` - Backend services build
- `deployment/ecosystem.config.js` - PM2 configuration
- `deployment/docker-init-db.sh` - Database initialization
- `deployment/frontend.Dockerfile` - Frontend build
- `deployment/nginx.conf` - Nginx configuration
- `deployment/.dockerignore` - Build optimization
