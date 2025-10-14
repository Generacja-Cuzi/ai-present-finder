# Docker Compose Production Configuration

Detailed documentation for `docker-compose.prod.yml` and related production files.

## Table of Contents

- [Overview](#overview)
- [Services](#services)
- [Volumes](#volumes)
- [Networks](#networks)
- [Environment Variables](#environment-variables)
- [Build Process](#build-process)
- [Configuration Files](#configuration-files)

## Overview

The production Docker Compose setup consists of 4 main services:

1. **rabbitmq** - Message queue for inter-service communication
2. **postgres** - Single database instance with multiple databases
3. **app** - All backend microservices in one container (managed by PM2)
4. **frontend** - React app served by Nginx

## Services

### RabbitMQ Service

```yaml
rabbitmq:
  image: rabbitmq:3.12-management
  environment:
    RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER:?}
    RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASS:?}
  volumes:
    - rabbitmq_data:/var/lib/rabbitmq
  healthcheck:
    test: rabbitmq-diagnostics -q ping
    interval: 30s
    timeout: 30s
    retries: 3
```

**Purpose**: Message broker for asynchronous communication between microservices.

**Key Points**:

- Uses management plugin (port 15672 not exposed in production)
- **Credentials are REQUIRED** - no defaults provided for security
- Persistent storage via named volume
- Health check ensures service is ready before dependent services start
- Both `RABBITMQ_USER` and `RABBITMQ_PASS` must be set before deployment

**Queues Created**:

- Named after event classes (e.g., `StalkingAnalyzeRequestedEvent`)
- Non-durable by default
- Created automatically when services publish/subscribe

### PostgreSQL Service

```yaml
postgres:
  image: postgres:16
  environment:
    POSTGRES_USER: ${POSTGRES_USER:-postgres}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?}
    POSTGRES_DB: postgres
    POSTGRES_MULTIPLE_DATABASES: reranking_service,fetch_service,stalking_service,chat_service,gift_ideas_service
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./deployment/docker-init-db.sh:/docker-entrypoint-initdb.d/init-databases.sh:ro
  healthcheck:
    test: ["CMD-SHELL", 'pg_isready -U "$${POSTGRES_USER:-postgres}"']
    interval: 30s
    timeout: 10s
    retries: 3
```

**Purpose**: Single PostgreSQL instance hosting all microservice databases.

**Key Points**:

- PostgreSQL 16 for latest features and performance
- Master password is required (`:?` syntax)
- User defaults to `postgres` but can be overridden via `POSTGRES_USER`
- Initialization script (`deployment/docker-init-db.sh`) creates all databases on first run
- Health check dynamically uses the configured `POSTGRES_USER`
- Persistent storage via named volume
- Health check ensures database is accepting connections

**Databases Created**:

1. `reranking_service` - Gift reranking data
2. `fetch_service` - Product fetching cache
3. `stalking_service` - User analysis data
4. `chat_service` - Interview sessions
5. `gift_ideas_service` - AI-generated gift suggestions

**Database Initialization**:

- Runs `docker-init-db.sh` on first startup
- Creates all databases automatically
- Idempotent (safe to run multiple times)

### App Service

```yaml
app:
  build:
    context: .
    dockerfile: Dockerfile
  environment:
    NODE_ENV: production
    CLOUDAMQP_URL: ${CLOUDAMQP_URL:-amqp://admin:admin@rabbitmq:5672}
    OPENAI_API_KEY: ${OPENAI_API_KEY:?}
    BRIGHTDATA_API_KEY: ${BRIGHTDATA_API_KEY:?}
    # Database URLs...
    # Service ports...
    SERVICE_FQDN_APP_3000:
  depends_on:
    rabbitmq:
      condition: service_healthy
    postgres:
      condition: service_healthy
```

**Purpose**: Single container running all backend microservices via PM2.

**Key Points**:

- Multi-stage Docker build (see Dockerfile)
- Waits for postgres and rabbitmq to be healthy
- PM2 manages 10 separate Node.js processes
- All services communicate via localhost (fast!)
- Coolify routes external traffic via `SERVICE_FQDN_APP_3000`

**Services Running Inside**:

1. restapi-macroservice (port 3000) - REST API + SSE
2. stalking-microservice (port 3010) - User data analysis
3. chat-microservice (port 3020) - Interview flow
4. gift-microservice (port 3030) - Gift generation
5. gift-ideas-microservice (port 3040) - AI suggestions
6. reranking-microservice (port 3050) - Gift ranking
7. fetch-microservice-olx (port 8011) - OLX scraper
8. fetch-microservice-allegro (port 8012) - Allegro scraper
9. fetch-microservice-ebay (port 8013) - eBay scraper
10. fetch-microservice-amazon (port 8014) - Amazon scraper

**Process Management**:

- PM2 in cluster mode
- Automatic restarts on failure
- Log aggregation
- Memory limits per process

### Frontend Service

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  environment:
    NODE_ENV: production
    VITE_API_URL: ${SERVICE_URL_APP:-http://localhost:3000}
    SERVICE_FQDN_FRONTEND_80:
  depends_on:
    - app
```

**Purpose**: React frontend served by Nginx.

**Key Points**:

- Multi-stage build (Vite + Nginx)
- Static assets served by Nginx
- SPA routing support
- Gzip compression
- Security headers
- Coolify routes external traffic via `SERVICE_FQDN_FRONTEND_80`

## Volumes

```yaml
volumes:
  rabbitmq_data:
  postgres_data:
```

### rabbitmq_data

- **Purpose**: Persist RabbitMQ messages and configurations
- **Location**: Docker managed volume
- **Backup**: Optional (queues are typically transient)
- **Size**: Usually < 1GB

### postgres_data

- **Purpose**: Persist all database data
- **Location**: Docker managed volume
- **Backup**: **Critical** - Regular backups required
- **Size**: Grows with application usage

## Networks

```yaml
networks:
  ai-present-finder-network:
    driver: bridge
```

**Default Network**: All services connect to a single bridge network.

**Internal Communication**:

- Services communicate via service names (e.g., `http://app:3000`)
- DNS resolution provided by Docker
- No external exposure (Coolify handles ingress)

**External Access**:

- Managed entirely by Coolify's reverse proxy (Traefik)
- No ports exposed in docker-compose.prod.yml
- SSL/TLS terminated at proxy level

## Environment Variables

### Required Variables

Must be set before deployment:

```bash
# API Keys
OPENAI_API_KEY          # OpenAI API key for chat and gift ideas
BRIGHTDATA_API_KEY      # BrightData API key for web scraping

# Database
POSTGRES_PASSWORD       # PostgreSQL master password

# Message Queue - Must provide credentials (no defaults)
RABBITMQ_USER           # RabbitMQ username (required)
RABBITMQ_PASS           # RabbitMQ password (required)
```

**Note on RabbitMQ**: For security, no default credentials are provided. You must explicitly set both `RABBITMQ_USER` and `RABBITMQ_PASS` before deploying.

**Note on CLOUDAMQP_URL**: You can either:

1. Set `RABBITMQ_USER` and `RABBITMQ_PASS` (connection URL will be constructed as `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@rabbitmq:5672`), OR
2. Provide a complete `CLOUDAMQP_URL` directly (overrides the constructed URL)

### Optional Variables (with defaults)

```bash
# PostgreSQL
POSTGRES_USER=postgres  # Can be overridden if needed

# Database URLs (auto-constructed from user/password variables)
# Each service has separate credentials with defaults shown below
RERANKING_DB_USER=reranking_user
RERANKING_DB_PASSWORD=reranking_password
RERANKING_DATABASE_URL=postgresql://${RERANKING_DB_USER}:${RERANKING_DB_PASSWORD}@postgres:5432/reranking_service

FETCH_DB_USER=fetch_user
FETCH_DB_PASSWORD=fetch_password
FETCH_DATABASE_URL=postgresql://${FETCH_DB_USER}:${FETCH_DB_PASSWORD}@postgres:5432/fetch_service

STALKING_DB_USER=stalking_user
STALKING_DB_PASSWORD=stalking_password
STALKING_DATABASE_URL=postgresql://${STALKING_DB_USER}:${STALKING_DB_PASSWORD}@postgres:5432/stalking_service

CHAT_DB_USER=chat_user
CHAT_DB_PASSWORD=chat_password
CHAT_DATABASE_URL=postgresql://${CHAT_DB_USER}:${CHAT_DB_PASSWORD}@postgres:5432/chat_service

GIFT_IDEAS_DB_USER=gift_ideas_user
GIFT_IDEAS_DB_PASSWORD=gift_ideas_password
GIFT_IDEAS_DATABASE_URL=postgresql://${GIFT_IDEAS_DB_USER}:${GIFT_IDEAS_DB_PASSWORD}@postgres:5432/gift_ideas_service

# Service Ports (internal)
RESTAPI_PORT=3000
STALKING_PORT=3010
CHAT_PORT=3020
GIFT_PORT=3030
GIFT_IDEAS_PORT=3040
RERANKING_PORT=3050
FETCH_OLX_PORT=8011
FETCH_ALLEGRO_PORT=8012
FETCH_EBAY_PORT=8013
FETCH_AMAZON_PORT=8014

# Frontend
VITE_API_URL              # Auto-set by Coolify based on SERVICE_URL_APP
```

### Coolify Magic Variables

Coolify provides special environment variables:

- `SERVICE_FQDN_APP_3000` - Auto-generates FQDN for app service
- `SERVICE_FQDN_FRONTEND_80` - Auto-generates FQDN for frontend
- `SERVICE_URL_APP` - URL to reach the app service

These are automatically populated when you assign domains in Coolify.

## Build Process

### App Build (Dockerfile)

**Stage 1: Builder**

```dockerfile
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend ./backend
COPY core ./core
RUN pnpm install --frozen-lockfile
RUN pnpm run build
```

- Uses Node 22 Alpine for small image size
- Installs pnpm 10
- Copies workspace configuration
- Installs all dependencies
- Builds all backend services

**Stage 2: Production**

```dockerfile
FROM node:22-alpine
RUN corepack enable && npm install -g pm2
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend
COPY ecosystem.config.js ./
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
```

- Clean Node 22 Alpine image
- Installs PM2 globally
- Copies only necessary files from builder
- Starts all services with PM2

**Build Optimizations**:

- Multi-stage build reduces final image size
- .dockerignore excludes unnecessary files
- Layer caching for faster rebuilds
- pnpm for efficient dependency management

### Frontend Build (frontend/Dockerfile)

**Stage 1: Builder**

```dockerfile
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
```

- Builds React app with Vite
- Optimizes assets (minification, tree-shaking)
- Generates production bundle

**Stage 2: Production**

```dockerfile
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
```

- Lightweight Nginx Alpine image
- Serves static files
- Custom nginx configuration for SPA

## Configuration Files

### ecosystem.config.js

PM2 process configuration for all microservices.

**Key Features**:

- Each service defined as separate app
- Cluster mode for better CPU utilization
- Environment variables per service
- Automatic restart on failure
- Log management

**Example Entry**:

```javascript
{
  name: 'restapi-macroservice',
  cwd: './backend/restapi-macroservice',
  script: 'dist/main.js',
  instances: 1,
  exec_mode: 'cluster',
  env: {
    NODE_ENV: 'production',
    PORT: process.env.RESTAPI_PORT || 3000,
  },
}
```

**Scaling**: Increase `instances` to scale individual services.

### docker-init-db.sh

PostgreSQL initialization script.

**Purpose**: Create multiple databases on first PostgreSQL startup.

**How It Works**:

1. Reads `POSTGRES_MULTIPLE_DATABASES` environment variable
2. Splits by comma
3. Creates each database
4. Runs only once (on first startup)

**Script**:

```bash
#!/bin/bash
set -e
set -u

function create_database() {
  local database=$1
  echo "Creating database '$database'"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE $database;
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
  echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
  for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
    create_database $db
  done
  echo "Multiple databases created"
fi
```

### frontend/nginx.conf

Nginx configuration for serving the React SPA.

**Key Features**:

- SPA routing (all routes go to index.html)
- Gzip compression for smaller transfers
- Security headers
- Static asset caching (1 year)
- Health check endpoint

**Configuration Highlights**:

```nginx
# SPA fallback
location / {
  try_files $uri $uri/ /index.html;
}

# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### .dockerignore

Excludes files from Docker build context.

**Excluded**:

- node_modules (reinstalled during build)
- Build outputs (regenerated)
- Development files (.git, .vscode, etc.)
- Test files
- Documentation
- Environment files (except .env.example)

**Benefit**: Faster builds, smaller context size.

## Deployment Workflow

1. **Coolify receives docker-compose.prod.yml**
2. **Parses configuration and detects services**
3. **Builds images**:
   - App: Multi-stage build with pnpm
   - Frontend: Multi-stage build with Vite + Nginx
4. **Creates volumes** (if not exist)
5. **Creates network**
6. **Starts services** in dependency order:
   - rabbitmq (waits for health check)
   - postgres (waits for health check, runs init script)
   - app (waits for rabbitmq + postgres)
   - frontend (waits for app)
7. **Configures reverse proxy** (Traefik):
   - Routes requests to app:3000
   - Routes requests to frontend:80
8. **Provisions SSL certificates** (Let's Encrypt)
9. **Monitors health checks**
10. **Reports deployment status**

## Maintenance

### Updating the Application

1. **Push code changes** to repository
2. **In Coolify, click "Redeploy"**
3. **Coolify will**:
   - Rebuild images
   - Stop old containers
   - Start new containers
   - Run health checks
   - Switch traffic to new version

### Database Migrations

```bash
# SSH into server
docker exec -it <app-container> sh

# Navigate to service directory
cd backend/stalking-microservice

# Run Prisma migrations
npx prisma migrate deploy
```

### Viewing Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f app

# PM2 logs (inside app container)
docker exec -it <app-container> pm2 logs
```

### Backup Database

```bash
# Dump all databases
docker exec <postgres-container> pg_dumpall -U postgres > backup.sql

# Restore
docker exec -i <postgres-container> psql -U postgres < backup.sql
```

### Scaling

**Vertical Scaling** (increase resources):

- In Coolify, adjust CPU/Memory limits
- Redeploy

**Horizontal Scaling** (multiple instances):

- Modify `ecosystem.config.js` to increase PM2 instances
- Or deploy multiple app containers with external RabbitMQ/PostgreSQL

## Performance Tuning

### Database

- **Connection Pooling**: Adjust in Prisma config
- **Indexes**: Add on frequently queried columns
- **Query Optimization**: Use EXPLAIN ANALYZE

### Application

- **PM2 Instances**: Match to CPU cores
- **Memory Limits**: Set in ecosystem.config.js
- **Caching**: Add Redis for frequently accessed data

### Frontend

- **CDN**: Serve static assets from CDN
- **Code Splitting**: Already done by Vite
- **Image Optimization**: Use WebP format

## Security Best Practices

1. **Change default passwords**
   - PostgreSQL, RabbitMQ
2. **Use secrets management**
   - Coolify's encrypted environment variables
3. **Regular updates**
   - Keep Docker images updated
4. **Monitor logs**
   - Check for suspicious activity
5. **Backup regularly**
   - Automated daily backups
6. **Limit access**
   - Use firewall rules
   - VPN for admin access

## Cost Optimization

The single-container architecture minimizes costs:

- **Single app container** instead of 10 separate containers
- **Single PostgreSQL** instead of 5 separate databases
- **No managed services** needed (self-hosted)
- **Efficient resource usage** with PM2

Estimated monthly cost: **$20-60** depending on server size.
