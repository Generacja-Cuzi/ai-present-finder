# Database Connection and Deployment Fixes

## Summary

Fixed multiple issues preventing the application from connecting to the database and deploying correctly on Coolify.

## Issues Fixed

### 1. Database Connection Failures

**Problem**: Microservices couldn't connect to PostgreSQL database - containers were trying to connect to `127.0.0.1:5432` instead of the `postgres` service.

**Root Causes**:

- Database users (`reranking_user`, `fetch_user`, `stalking_user`, `chat_user`, `gift_ideas_user`) were not being created
- TypeORM configuration was using individual environment variables (DATABASE_HOST, DATABASE_PORT, etc.) instead of parsing the provided DATABASE_URL
- The `docker-init-db.sh` script only created databases, not users

**Solutions**:

1. **Updated `deployment/docker-init-db.sh`**:
   - Now creates both databases AND users
   - Automatically derives usernames from database names (e.g., `reranking_service` → `reranking_user`)
   - Grants proper schema-level permissions

2. **Updated TypeORM configurations** in:
   - `backend/reranking-microservice/src/webapi/reranking.module.ts`
   - `backend/gift-ideas-microservice/src/webapi/modules/gift.module.ts`
   - Both now parse `DATABASE_URL` environment variable first, falling back to individual vars

### 2. Health Check Failures

#### Backend App Health Check

**Problem**: Docker health check was looking for `/health` endpoint that didn't exist, causing app container to be marked unhealthy.

**Solution**: Added `/health` endpoint to `backend/restapi-macroservice/src/app.controller.ts` that returns `{ status: "ok" }`

#### Frontend Health Check

**Problem**: Health check was failing because wget was resolving `localhost` to IPv6 `[::1]:80`, but nginx was only listening on IPv4.

**Solutions**:

1. Updated `deployment/nginx.conf` to listen on both IPv4 and IPv6: `listen [::]:80;`
2. Updated health check in `deployment/frontend.Dockerfile` to explicitly use IPv4: `http://127.0.0.1/health`

### 3. Frontend API URL Configuration

**Problem**: Frontend was hardcoded to connect to `http://localhost:3000` in production, not using the actual production API URL.

**Root Cause**: Vite environment variables are baked into the build at build-time, but Coolify's `SERVICE_URL_APP` is only available at runtime.

**Solution**: Implemented runtime configuration injection:

1. **Created `deployment/docker-entrypoint-frontend.sh`**:
   - Runs at container startup
   - Generates `/usr/share/nginx/html/config.js` with runtime API URL
   - Reads from `SERVICE_URL_APP` environment variable (set by Coolify)

2. **Updated `deployment/frontend.Dockerfile`**:
   - Uses custom entrypoint script
   - Maintains build-time defaults for local development

3. **Updated `frontend/src/lib/backend-url.ts`**:
   - Checks `window.__RUNTIME_CONFIG__` first (injected at runtime)
   - Falls back to build-time `VITE_BACKEND_URL`
   - Falls back to localhost for development

4. **Updated `frontend/index.html`**:
   - Loads `/config.js` before main application bundle
   - Ensures runtime config is available when app initializes

## Manual Steps Performed on Production

Since the database was already running without users, we manually created them via SSH:

```bash
# Created users
docker exec <postgres-container> psql -U postgres -c "CREATE USER reranking_user WITH PASSWORD 'reranking_password';"
docker exec <postgres-container> psql -U postgres -c "CREATE USER fetch_user WITH PASSWORD 'fetch_password';"
docker exec <postgres-container> psql -U postgres -c "CREATE USER stalking_user WITH PASSWORD 'stalking_password';"
docker exec <postgres-container> psql -U postgres -c "CREATE USER chat_user WITH PASSWORD 'chat_password';"
docker exec <postgres-container> psql -U postgres -c "CREATE USER gift_ideas_user WITH PASSWORD 'gift_ideas_password';"

# Granted database permissions
docker exec <postgres-container> psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE reranking_service TO reranking_user;"
# ... (repeated for all databases)

# Granted schema permissions
docker exec <postgres-container> psql -U postgres -d reranking_service -c "GRANT ALL ON SCHEMA public TO reranking_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO reranking_user; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO reranking_user;"
# ... (repeated for all databases)
```

These manual steps won't be needed for new deployments since `docker-init-db.sh` now handles user creation automatically.

## Verification

After fixes, all containers should show healthy status:

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}'
# All should show (healthy)
```

## Files Changed

- `deployment/docker-init-db.sh` - Database and user creation script
- `backend/reranking-microservice/src/webapi/reranking.module.ts` - TypeORM DATABASE_URL parsing
- `backend/gift-ideas-microservice/src/webapi/modules/gift.module.ts` - TypeORM DATABASE_URL parsing
- `backend/restapi-macroservice/src/app.controller.ts` - Added /health endpoint
- `deployment/nginx.conf` - IPv6 support
- `deployment/frontend.Dockerfile` - Updated health check and entrypoint
- `deployment/docker-entrypoint-frontend.sh` - NEW: Runtime config injection script
- `deployment/docker-compose.prod.yml` - Updated frontend environment variables
- `frontend/src/lib/backend-url.ts` - Runtime config support
- `frontend/index.html` - Load runtime config before app

## Testing

Local testing:

```bash
cd deployment
docker-compose -f docker-compose.prod.yml --env-file .unencrypted-env.test up --build
```

All services should start successfully with healthy status.
