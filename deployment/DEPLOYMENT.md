# Production Deployment Guide for Coolify

This guide explains how to deploy the AI Present Finder application to Coolify using the production Docker Compose configuration.

## Architecture

The production setup uses:

- **Single application container** running all microservices via PM2
- **Single PostgreSQL instance** with multiple databases
- **RabbitMQ** for message queuing
- **Frontend** served by Nginx

## Prerequisites

1. A Coolify instance set up and running
2. Access to the Coolify dashboard
3. Required API keys:
   - OpenAI API Key
   - BrightData API Key

## Deployment Steps

### 1. Create a New Resource in Coolify

1. Go to your Coolify dashboard
2. Click **+ New Resource**
3. Select **Docker Compose**
4. Choose your desired server/destination

### 2. Configure the Docker Compose

1. Set the **Project Name**: `ai-present-finder`
2. Upload or paste the content of `docker-compose.prod.yml`
3. Coolify will automatically detect the services

### 3. Configure Environment Variables

In the Coolify UI, set the following **required** environment variables:

```bash
# Required API Keys
OPENAI_API_KEY=your-openai-api-key-here
BRIGHTDATA_API_KEY=your-brightdata-api-key-here

# Required Database Password
POSTGRES_PASSWORD=your-secure-postgres-password-here
```

**Optional** environment variables (with defaults):

```bash
# RabbitMQ Configuration
RABBITMQ_USER=admin
RABBITMQ_PASS=admin

# Database Configuration
POSTGRES_USER=postgres
RERANKING_DB_USER=reranking_user
RERANKING_DB_PASSWORD=reranking_password
FETCH_DB_USER=fetch_user
FETCH_DB_PASSWORD=fetch_password
STALKING_DB_USER=stalking_user
STALKING_DB_PASSWORD=stalking_password
CHAT_DB_USER=chat_user
CHAT_DB_PASSWORD=chat_password
GIFT_IDEAS_DB_USER=gift_ideas_user
GIFT_IDEAS_DB_PASSWORD=gift_ideas_password

# RabbitMQ Connection (internal by default)
CLOUDAMQP_URL=amqp://admin:admin@rabbitmq:5672
```

### 4. Configure Domains

Coolify will detect your services and allow you to assign domains:

1. **app** service (main backend):
   - Assign your API domain: `api.yourdomain.com`
   - Port: 3000 (Coolify will handle this automatically)
   - This is the main entry point for all API requests

2. **frontend** service:
   - Assign your frontend domain: `yourdomain.com` or `app.yourdomain.com`
   - Port: 80 (Coolify will handle this automatically)

**Important**: Update the `VITE_API_URL` environment variable for the frontend service to point to your API domain:

```bash
VITE_API_URL=https://api.yourdomain.com
```

### 5. Deploy

1. Click **Deploy** in Coolify
2. Coolify will:
   - Build the Docker images
   - Create the PostgreSQL databases
   - Start all services
   - Set up SSL certificates (if using HTTPS)
   - Configure the reverse proxy

3. Monitor the deployment logs for any errors

### 6. Verify Deployment

Once deployed, verify each service:

1. **Frontend**: Visit your frontend domain
2. **API Health**: Visit `https://api.yourdomain.com/health`
3. **API Documentation**: Visit `https://api.yourdomain.com/docs` (Swagger UI)

## Service Architecture

### Application Container (app)

The single `app` container runs all microservices using PM2:

- **restapi-macroservice** (port 3000) - Main REST API and SSE endpoint
- **stalking-microservice** (port 3010) - User data analysis
- **chat-microservice** (port 3020) - Interview flow management
- **gift-microservice** (port 3030) - Gift generation
- **gift-ideas-microservice** (port 3040) - AI-powered gift ideas
- **reranking-microservice** (port 3050) - Gift ranking
- **fetch-microservice-olx** (port 8011) - OLX scraper
- **fetch-microservice-allegro** (port 8012) - Allegro scraper
- **fetch-microservice-ebay** (port 8013) - eBay scraper
- **fetch-microservice-amazon** (port 8014) - Amazon scraper

All services communicate internally via:

- **RabbitMQ** for async messaging
- **PostgreSQL** for data persistence

### Database Structure

Single PostgreSQL instance with multiple databases:

- `reranking_service`
- `fetch_service`
- `stalking_service`
- `chat_service`
- `gift_ideas_service`

## Coolify-Specific Features

### Domain Routing

Coolify uses the `SERVICE_FQDN_*` magic variables to automatically configure routing:

- `SERVICE_FQDN_APP_3000` - Routes traffic to the main API on port 3000
- `SERVICE_FQDN_FRONTEND_80` - Routes traffic to the frontend on port 80

### SSL Certificates

Coolify automatically provisions SSL certificates via Let's Encrypt when you:

1. Assign a domain to a service
2. Ensure DNS is properly configured
3. Use `https://` in the domain field

### Persistent Storage

The following volumes are persisted:

- `rabbitmq_data` - RabbitMQ message queue data
- `postgres_data` - All PostgreSQL databases

## Scaling Considerations

### Horizontal Scaling

To scale individual services, you can:

1. Increase PM2 instances in `ecosystem.config.js`
2. Deploy multiple app containers (requires external RabbitMQ and PostgreSQL)

### Vertical Scaling

Adjust container resources in Coolify:

1. Go to the service settings
2. Modify **Memory Limit** and **CPU Limit**
3. Redeploy

## Monitoring

### Logs

View logs in Coolify:

1. Go to your resource
2. Click on a service
3. View **Logs** tab

### PM2 Monitoring

To check PM2 status inside the container:

```bash
pm2 list
pm2 logs
pm2 monit
```

## Troubleshooting

### Service Won't Start

1. Check environment variables are set correctly
2. Verify database connections
3. Check logs for specific error messages

### Database Connection Issues

Ensure the database URLs are correct:

```bash
postgresql://<user>:<password>@postgres:5432/<database_name>
```

### RabbitMQ Connection Issues

Verify `CLOUDAMQP_URL` is set correctly:

```bash
amqp://admin:admin@rabbitmq:5672
```

### Frontend Can't Connect to API

1. Verify `VITE_API_URL` is set to your API domain
2. Check CORS settings in the API
3. Verify SSL certificates are valid

## Updating the Application

To deploy updates:

1. Push changes to your Git repository
2. In Coolify, click **Redeploy**
3. Coolify will rebuild and restart services

For zero-downtime deployments:

1. Use Coolify's **Rolling Updates** feature
2. Ensure health checks are properly configured

## Backup and Recovery

### Database Backup

Use Coolify's backup features or set up manual backups:

```bash
# Inside the postgres container
pg_dump -U postgres database_name > backup.sql
```

### Restore Database

```bash
# Inside the postgres container
psql -U postgres database_name < backup.sql
```

## Security Recommendations

1. **Change default passwords** for RabbitMQ and PostgreSQL
2. **Use strong passwords** for all services
3. **Enable Coolify's built-in firewall** rules
4. **Regularly update** Docker images and dependencies
5. **Monitor logs** for suspicious activity
6. **Use secrets management** for sensitive environment variables

## Support

For issues specific to:

- **Application**: Check application logs and README.md
- **Coolify**: Visit [Coolify Documentation](https://coolify.io/docs)
- **Docker**: Check Docker logs and container status
