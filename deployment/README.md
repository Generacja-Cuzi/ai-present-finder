# Deployment Directory

This directory contains all files needed for deploying the AI Present Finder application to production.

## Files Overview

### Core Configuration

- **`docker-compose.prod.yml`** - Production Docker Compose configuration
  - Single app container with all microservices
  - PostgreSQL with multiple databases
  - RabbitMQ for messaging
  - Frontend served by Nginx

- **`Dockerfile`** - Multi-stage build for backend services
  - Builds all microservices in one container
  - Uses PM2 to manage all services

- **`ecosystem.config.js`** - PM2 process manager configuration
  - Manages 10 separate Node.js processes
  - Each microservice runs as separate PM2 app

### Database

- **`docker-init-db.sh`** - PostgreSQL initialization script
  - Creates 5 databases on first startup
  - Executable script for database setup

### Frontend

- **`frontend.Dockerfile`** - Frontend production build
  - Multi-stage build with Vite + Nginx
  - Optimized static asset serving

- **`nginx.conf`** - Nginx configuration for SPA
  - SPA routing support
  - Gzip compression
  - Security headers
  - Static asset caching

### Build Optimization

- **`.dockerignore`** - Excludes unnecessary files from builds
  - Reduces build context size
  - Faster builds

### Documentation

- **`PRODUCTION_README.md`** - Quick production setup guide
- **`DEPLOYMENT.md`** - Detailed deployment instructions

## Quick Deployment

1. **Set required environment variables in Coolify:**

   ```bash
   OPENAI_API_KEY=your-key-here
   BRIGHTDATA_API_KEY=your-key-here
   POSTGRES_PASSWORD=your-secure-password
   ```

2. **Upload `docker-compose.prod.yml` to Coolify**

3. **Assign domains:**
   - `app` service → Your API domain (e.g., `api.yourdomain.com`)
   - `frontend` service → Your frontend domain (e.g., `yourdomain.com`)

4. **Deploy and enjoy!**

## Architecture

The production setup uses:

- **Single application container** running all microservices via PM2
- **Single PostgreSQL instance** with multiple databases
- **RabbitMQ** for message queuing
- **Frontend** served by Nginx

## Directory Structure

```
deployment/
├── docker-compose.prod.yml    # Main production configuration
├── Dockerfile                 # Backend services build
├── ecosystem.config.js        # PM2 process management
├── docker-init-db.sh          # Database initialization
├── frontend.Dockerfile        # Frontend build
├── nginx.conf                 # Nginx configuration
├── .dockerignore              # Build optimization
├── PRODUCTION_README.md       # Quick start guide
└── DEPLOYMENT.md              # Detailed deployment guide
```

## Usage

### Development

For development, use the root `docker-compose.yml` and `pnpm dev`.

### Production

For production deployment, use the files in this directory with Coolify.

## Support

- See `docs/deployment/` for comprehensive documentation
- Check `docs/deployment/troubleshooting.md` for common issues
- Visit [Coolify Documentation](https://coolify.io/docs) for platform-specific help
