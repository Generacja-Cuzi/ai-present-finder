# Production Docker Compose Setup

This directory contains the production-ready Docker Compose configuration optimized for Coolify deployment.

## Quick Start

1. **Set required environment variables in Coolify:**

   ```bash
   OPENAI_API_KEY=your-key-here
   BRIGHTDATA_API_KEY=your-key-here
   POSTGRES_PASSWORD=your-secure-password
   ```

2. **Deploy the `docker-compose.prod.yml` file in Coolify**

3. **Assign domains:**
   - `app` service → Your API domain (e.g., `api.yourdomain.com`)
   - `frontend` service → Your frontend domain (e.g., `yourdomain.com`)

4. **Access your application:**
   - Frontend: `https://yourdomain.com`
   - API: `https://api.yourdomain.com`
   - Swagger Docs: `https://api.yourdomain.com/docs`

## Architecture

- **One app container** with PM2 running all 10 microservices
- **One PostgreSQL** instance with 5 databases
- **RabbitMQ** for message queuing
- **Frontend** served by Nginx

## Files

- `docker-compose.prod.yml` - Main Coolify deployment configuration
- `Dockerfile` - Multi-stage build for all backend services
- `ecosystem.config.js` - PM2 configuration for all microservices
- `docker-init-db.sh` - PostgreSQL database initialization script
- `frontend/Dockerfile` - Frontend build with Nginx
- `frontend/nginx.conf` - Nginx configuration for SPA
- `DEPLOYMENT.md` - Detailed deployment guide

## Why This Architecture?

1. **Cost-effective**: Single container reduces resource usage
2. **Simple**: No need to manage multiple containers
3. **Fast**: All services communicate via localhost
4. **Coolify-friendly**: Minimal configuration needed

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete guide.
