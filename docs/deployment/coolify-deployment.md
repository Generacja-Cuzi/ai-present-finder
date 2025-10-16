# Coolify Deployment Guide

Complete step-by-step guide for deploying AI Present Finder to Coolify.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Steps](#deployment-steps)
- [Environment Variables](#environment-variables)
- [Domain Configuration](#domain-configuration)
- [Verification](#verification)
- [Post-Deployment](#post-deployment)

## Prerequisites

Before you begin, ensure you have:

1. ✅ A Coolify instance set up and running
2. ✅ Access to the Coolify dashboard
3. ✅ A domain name with DNS configured
4. ✅ Required API keys:
   - OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))
   - BrightData API Key ([Sign up here](https://brightdata.com/))

## Deployment Steps

### Step 1: Create a New Resource in Coolify

1. Log in to your Coolify dashboard
2. Click **+ New Resource**
3. Select **Docker Compose**
4. Choose your desired server/destination
5. Set the **Project Name**: `ai-present-finder`

### Step 2: Upload Docker Compose File

1. In the Coolify resource configuration page
2. Click on the **Docker Compose** tab
3. Upload or paste the content of `deployment/docker-compose.prod.yml` from your repository
4. Coolify will automatically parse and detect all services:
   - `rabbitmq` - Message queue
   - `postgres` - Database server
   - `app` - All backend microservices
   - `frontend` - React frontend

### Step 3: Configure Environment Variables

Click on the **Environment Variables** tab and add the following:

#### Required Variables

These **must** be set before deployment:

```bash
# OpenAI API Key (Required)
OPENAI_API_KEY=sk-proj-...your-key-here

# BrightData API Key (Required)
BRIGHTDATA_API_KEY=your-brightdata-key-here

# PostgreSQL Master Password (Required)
POSTGRES_PASSWORD=your-very-secure-password-here
```

#### Optional Variables

These have sensible defaults but can be customized:

```bash
# RabbitMQ Credentials (defaults: admin/admin)
RABBITMQ_USER=admin
RABBITMQ_PASS=your-secure-rabbitmq-password

# PostgreSQL Main User (default: postgres)
POSTGRES_USER=postgres

# Database-specific users and passwords
RERANKING_DB_USER=reranking_user
RERANKING_DB_PASSWORD=secure-password-1

FETCH_DB_USER=fetch_user
FETCH_DB_PASSWORD=secure-password-2

STALKING_DB_USER=stalking_user
STALKING_DB_PASSWORD=secure-password-3

CHAT_DB_USER=chat_user
CHAT_DB_PASSWORD=secure-password-4

GIFT_IDEAS_DB_USER=gift_ideas_user
GIFT_IDEAS_DB_PASSWORD=secure-password-5
```

**Security Best Practice**: Change all passwords to strong, unique values in production!

### Step 4: Configure Domains

Coolify will detect the `app` and `frontend` services. Assign domains to them:

#### Backend API (app service)

1. Click on the **app** service
2. In the **Domains** section, add your API domain:

   ```
   https://api.yourdomain.com
   ```

3. Coolify uses the `SERVICE_FQDN_APP_3000` environment variable
4. The app listens on internal port 3000
5. Coolify's proxy will handle:
   - SSL certificate provisioning (Let's Encrypt)
   - HTTPS redirection
   - Reverse proxy configuration

#### Frontend (frontend service)

1. Click on the **frontend** service
2. In the **Domains** section, add your frontend domain:

   ```
   https://yourdomain.com
   ```

   or

   ```
   https://app.yourdomain.com
   ```

3. Coolify uses the `SERVICE_FQDN_FRONTEND_80` environment variable
4. The frontend listens on internal port 80

#### Configure Frontend API URL

**Important**: After assigning the API domain, add this environment variable to the **frontend** service:

```bash
VITE_API_URL=https://api.yourdomain.com
```

This tells the frontend where to connect to the backend.

### Step 5: Deploy

1. Click the **Deploy** button in Coolify
2. Monitor the deployment logs
3. Coolify will:
   - Pull/build all Docker images
   - Create Docker volumes for data persistence
   - Initialize the PostgreSQL databases
   - Start all services in the correct order
   - Provision SSL certificates
   - Configure the reverse proxy

**Expected deployment time**: 5-15 minutes (first deployment, including builds)

### Step 6: Monitor Deployment

Watch the logs for each service:

```
✓ Building app image...
✓ Building frontend image...
✓ Starting rabbitmq...
✓ Starting postgres...
✓ Initializing databases...
✓ Starting app (all microservices)...
✓ Starting frontend...
✓ SSL certificates provisioned
✓ Deployment complete!
```

## Environment Variables

### Complete Reference

| Variable             | Required | Default    | Description                            |
| -------------------- | -------- | ---------- | -------------------------------------- |
| `OPENAI_API_KEY`     | ✅ Yes   | -          | OpenAI API key for chat and gift ideas |
| `BRIGHTDATA_API_KEY` | ✅ Yes   | -          | BrightData API key for web scraping    |
| `POSTGRES_PASSWORD`  | ✅ Yes   | -          | PostgreSQL master password             |
| `RABBITMQ_USER`      | No       | `admin`    | RabbitMQ username                      |
| `RABBITMQ_PASS`      | No       | `admin`    | RabbitMQ password                      |
| `POSTGRES_USER`      | No       | `postgres` | PostgreSQL master user                 |
| `CLOUDAMQP_URL`      | No       | Auto       | RabbitMQ connection URL                |
| `VITE_API_URL`       | No       | Auto       | Frontend API endpoint URL              |

### Database Users

Each microservice has its own database and user:

| Service    | Database             | User              | Password Variable        |
| ---------- | -------------------- | ----------------- | ------------------------ |
| Reranking  | `reranking_service`  | `reranking_user`  | `RERANKING_DB_PASSWORD`  |
| Fetch      | `fetch_service`      | `fetch_user`      | `FETCH_DB_PASSWORD`      |
| Stalking   | `stalking_service`   | `stalking_user`   | `STALKING_DB_PASSWORD`   |
| Chat       | `chat_service`       | `chat_user`       | `CHAT_DB_PASSWORD`       |
| Gift Ideas | `gift_ideas_service` | `gift_ideas_user` | `GIFT_IDEAS_DB_PASSWORD` |

## Domain Configuration

### DNS Setup

Before deploying, configure your DNS:

1. **API Domain** (e.g., `api.yourdomain.com`):

   ```
   Type: A
   Name: api
   Value: <your-server-ip>
   TTL: 300
   ```

2. **Frontend Domain** (e.g., `yourdomain.com`):

   ```
   Type: A
   Name: @
   Value: <your-server-ip>
   TTL: 300
   ```

### SSL Certificates

Coolify automatically provisions SSL certificates via Let's Encrypt:

- ✅ Certificates are auto-renewed
- ✅ HTTPS is enforced automatically
- ✅ HTTP redirects to HTTPS

**Requirements**:

- Domain must point to your server
- Ports 80 and 443 must be open
- Server must be reachable from the internet

## Verification

### 1. Check Service Health

After deployment, verify each service:

#### Backend API

```bash
curl https://api.yourdomain.com/health
# Expected: {"status": "ok"}
```

#### Frontend

```bash
curl https://yourdomain.com/health
# Expected: "healthy"
```

#### API Documentation

Visit: `https://api.yourdomain.com/docs`

You should see the Swagger UI with all API endpoints.

### 2. Check Service Logs

In Coolify, click on each service to view logs:

- **app**: Should show all 10 microservices starting
- **postgres**: Should show database initialization
- **rabbitmq**: Should show successful startup
- **frontend**: Should show Nginx startup

### 3. Test the Application

1. Open `https://yourdomain.com` in your browser
2. You should see the AI Present Finder landing page
3. Try starting a conversation
4. Verify SSE connection works (real-time updates)

## Post-Deployment

### Monitoring

1. **Enable Coolify Monitoring**:
   - Go to your resource settings
   - Enable monitoring features
   - Set up alerts (optional)

2. **Check PM2 Status** (inside app container):

   ```bash
   # In Coolify, open a terminal to the app container
   pm2 list
   ```

   You should see all 10 services running:
   - restapi-macroservice
   - stalking-microservice
   - chat-microservice
   - gift-microservice
   - gift-ideas-microservice
   - reranking-microservice
   - fetch-microservice-olx
   - fetch-microservice-allegro
   - fetch-microservice-ebay
   - fetch-microservice-amazon

3. **Database Check**:

   ```bash
   # In Coolify, open a terminal to the postgres container
   psql -U postgres -c "\l"
   ```

   You should see all 5 databases created.

### Backups

Set up automated backups:

1. **Database Backups**:
   - Use Coolify's backup feature
   - Or set up a cron job for `pg_dump`

2. **Volume Backups**:
   - `postgres_data`: Critical (daily backups)
   - `rabbitmq_data`: Less critical (weekly backups)

### Updates

To update the application:

1. Push changes to your Git repository
2. In Coolify, click **Redeploy**
3. Coolify will rebuild and restart services

For zero-downtime updates:

- Use Coolify's rolling update feature
- Deploy to staging first
- Test thoroughly before production

## Troubleshooting

### Issue: Services Won't Start

**Solution**:

1. Check environment variables are set correctly
2. View service logs in Coolify
3. Verify DNS is configured correctly
4. Check server resources (CPU, RAM, disk)

### Issue: SSL Certificate Fails

**Solution**:

1. Verify DNS points to your server
2. Check ports 80 and 443 are open
3. Wait a few minutes and try again
4. Check Coolify proxy logs

### Issue: Frontend Can't Connect to API

**Solution**:

1. Verify `VITE_API_URL` is set correctly on frontend service
2. Check API domain is accessible
3. Verify CORS settings in API
4. Check browser console for errors

### Issue: Database Connection Fails

**Solution**:

1. Verify `POSTGRES_PASSWORD` is set
2. Check database URLs in app service
3. View postgres logs
4. Verify database initialization completed

### Issue: RabbitMQ Connection Fails

**Solution**:

1. Check `CLOUDAMQP_URL` is correct
2. Verify RabbitMQ is running
3. Check RabbitMQ logs
4. Ensure credentials are correct

## Advanced Configuration

### Custom Port Configuration

If you need to change default ports, modify these environment variables:

```bash
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
```

### External Database

To use an external PostgreSQL instance:

1. Remove the `postgres` service from `docker-compose.prod.yml`
2. Update database URLs in the `app` service:

   ```bash
   STALKING_DATABASE_URL=postgresql://user:pass@external-db:5432/stalking_service
   CHAT_DATABASE_URL=postgresql://user:pass@external-db:5432/chat_service
   # ... etc
   ```

### External RabbitMQ

To use an external RabbitMQ instance:

1. Remove the `rabbitmq` service from `docker-compose.prod.yml`
2. Update `CLOUDAMQP_URL`:

   ```bash
   CLOUDAMQP_URL=amqps://user:pass@external-rabbitmq/vhost
   ```

## Security Checklist

Before going live:

- [ ] Changed all default passwords
- [ ] Set strong `POSTGRES_PASSWORD`
- [ ] Set strong `RABBITMQ_PASS`
- [ ] Configured firewall rules
- [ ] Enabled HTTPS/SSL
- [ ] Reviewed API rate limits
- [ ] Set up monitoring and alerts
- [ ] Configured backup strategy
- [ ] Tested disaster recovery
- [ ] Reviewed application logs
- [ ] Set up log rotation

## Performance Tuning

For high-traffic scenarios:

1. **Increase PM2 Instances** (edit `ecosystem.config.js`):

   ```javascript
   instances: 4, // Instead of 1
   ```

2. **Adjust Container Resources** in Coolify:
   - CPU: 4-8 cores
   - Memory: 8-16 GB

3. **Database Connection Pooling** (adjust in each service)

4. **Add CDN** for frontend static assets

## Support

- **Documentation**: See `docs/deployment/` for more guides
- **Issues**: Check `docs/deployment/troubleshooting.md`
- **Architecture**: See `docs/deployment/architecture.md`
- **Coolify Docs**: <https://coolify.io/docs>
