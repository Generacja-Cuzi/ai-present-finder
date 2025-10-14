# Troubleshooting Guide

Common issues and solutions for deploying AI Present Finder on Coolify.

## Table of Contents

- [Deployment Issues](#deployment-issues)
- [Service Issues](#service-issues)
- [Database Issues](#database-issues)
- [Network Issues](#network-issues)
- [SSL/Certificate Issues](#sslcertificate-issues)
- [Performance Issues](#performance-issues)
- [Debugging Tools](#debugging-tools)

## Deployment Issues

### Build Fails During Deployment

**Symptoms:**

- Docker build fails with errors
- Coolify shows build errors in logs

**Common Causes & Solutions:**

1. **Out of disk space**

   ```bash
   # Check disk usage on server
   df -h

   # Clean up unused Docker resources
   docker system prune -a
   ```

2. **Out of memory during build**
   - Increase server RAM
   - Or add swap space temporarily:

   ```bash
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

3. **Network timeout during npm install**
   - Check internet connectivity
   - Try redeploying (temporary network issue)
   - Use a different npm registry:
   ```dockerfile
   RUN npm config set registry https://registry.npmjs.org/
   ```

### Services Won't Start

**Symptoms:**

- Services crash immediately after starting
- Status shows "Exited" or "Restarting"

**Solutions:**

1. **Check environment variables**

   ```bash
   # In Coolify, verify all required variables are set:
   - OPENAI_API_KEY
   - BRIGHTDATA_API_KEY
   - POSTGRES_PASSWORD
   ```

2. **Check service dependencies**
   - Ensure postgres is healthy before app starts
   - Ensure rabbitmq is healthy before app starts
   - Check dependency order in docker-compose.prod.yml

3. **View service logs**
   - Click on the service in Coolify
   - View the "Logs" tab
   - Look for error messages

### Deployment Hangs or Times Out

**Symptoms:**

- Deployment stuck at a certain step
- No progress for 10+ minutes

**Solutions:**

1. **Cancel and retry**
   - Click "Cancel Deployment"
   - Wait 1 minute
   - Click "Redeploy"

2. **Check health checks**
   - Health checks might be failing
   - Temporarily disable health checks to debug
   - Check if ports are correct

3. **Resource exhaustion**
   - Check server CPU/RAM usage
   - May need to upgrade server

## Service Issues

### App Container Keeps Restarting

**Symptoms:**

- App service status shows "Restarting"
- Services cycle between running and stopped

**Debugging Steps:**

1. **Check PM2 logs**

   ```bash
   # In Coolify, open terminal to app container
   pm2 logs
   pm2 list
   ```

2. **Common issues:**
   - **Port already in use**
     ```bash
     # Check what's using the port
     netstat -tulpn | grep :3000
     ```
   - **Missing environment variables**
     ```bash
     # Inside container, check env
     env | grep -E 'OPENAI|BRIGHTDATA|DATABASE'
     ```
   - **Database connection failed**
     ```bash
     # Test database connection
     pg_isready -h postgres -U postgres
     ```

3. **Start services one by one**
   ```bash
   # In app container
   pm2 stop all
   pm2 start ecosystem.config.js --only restapi-macroservice
   pm2 logs restapi-macroservice
   ```

### Frontend Returns 502/504 Errors

**Symptoms:**

- Frontend domain shows "Bad Gateway" or "Gateway Timeout"
- Nginx errors in logs

**Solutions:**

1. **Check if app service is running**

   ```bash
   curl http://app:3000/health
   ```

2. **Verify VITE_API_URL is correct**
   - Should point to your API domain
   - Example: `https://api.yourdomain.com`

3. **Check Nginx configuration**

   ```bash
   # In frontend container
   nginx -t
   ```

4. **Restart frontend service**
   - In Coolify, restart the frontend service

### Microservices Not Communicating

**Symptoms:**

- Events not being processed
- SSE not receiving updates
- Timeout errors

**Debugging:**

1. **Check RabbitMQ**

   ```bash
   # View RabbitMQ management UI (if enabled)
   # Or check queues via CLI
   docker exec -it <rabbitmq-container> rabbitmqctl list_queues
   ```

2. **Verify CLOUDAMQP_URL**

   ```bash
   # Should be: amqp://admin:admin@rabbitmq:5672
   echo $CLOUDAMQP_URL
   ```

3. **Check event publishing**
   - View app logs for "published" messages
   - View app logs for "received" messages

4. **Test RabbitMQ connection**
   ```bash
   # From app container
   nc -zv rabbitmq 5672
   ```

## Database Issues

### Database Connection Refused

**Symptoms:**

- "Connection refused" errors in logs
- Services can't connect to postgres

**Solutions:**

1. **Check postgres is running**

   ```bash
   docker ps | grep postgres
   ```

2. **Verify DATABASE_URL format**

   ```
   postgresql://user:password@postgres:5432/database_name
   ```

3. **Check postgres logs**

   ```bash
   docker logs <postgres-container-id>
   ```

4. **Test connection from app**
   ```bash
   # In app container
   psql "postgresql://postgres:password@postgres:5432/postgres"
   ```

### Database Not Initialized

**Symptoms:**

- "database does not exist" errors
- Missing tables

**Solutions:**

1. **Check init script ran**

   ```bash
   # View postgres logs for "Multiple databases created"
   docker logs <postgres-container> | grep "Multiple databases"
   ```

2. **Manually create databases**

   ```bash
   # In postgres container
   psql -U postgres <<EOF
   CREATE DATABASE reranking_service;
   CREATE DATABASE fetch_service;
   CREATE DATABASE stalking_service;
   CREATE DATABASE chat_service;
   CREATE DATABASE gift_ideas_service;
   EOF
   ```

3. **Run migrations**
   ```bash
   # In app container, for each service
   cd backend/stalking-microservice
   npx prisma migrate deploy
   ```

### Database Performance Issues

**Symptoms:**

- Slow queries
- High database CPU usage
- Connection pool exhausted

**Solutions:**

1. **Check active connections**

   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

2. **Identify slow queries**

   ```sql
   SELECT pid, now() - pg_stat_activity.query_start AS duration, query
   FROM pg_stat_activity
   WHERE state = 'active'
   ORDER BY duration DESC;
   ```

3. **Increase connection pool size**
   - Edit service configuration
   - Add to DATABASE_URL: `?connection_limit=20`

4. **Add database indexes**
   - Identify frequently queried fields
   - Create indexes via migrations

## Network Issues

### Cannot Access Frontend/API

**Symptoms:**

- Domain shows "Site can't be reached"
- Connection timeout

**Solutions:**

1. **Verify DNS configuration**

   ```bash
   nslookup yourdomain.com
   # Should return your server IP
   ```

2. **Check firewall**

   ```bash
   # Ensure ports 80 and 443 are open
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **Verify Coolify proxy**
   - Check if Traefik is running
   - View Traefik logs in Coolify

4. **Check service domains**
   - In Coolify, verify domains are assigned correctly
   - No typos in domain names

### CORS Errors

**Symptoms:**

- Browser console shows CORS errors
- "Access-Control-Allow-Origin" errors

**Solutions:**

1. **Verify API domain in frontend**

   ```bash
   # VITE_API_URL should match your API domain
   echo $VITE_API_URL
   ```

2. **Check CORS configuration in REST API**
   - Ensure API allows your frontend domain
   - Check `main.ts` in restapi-macroservice

3. **Clear browser cache**
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### SSE Connection Fails

**Symptoms:**

- Real-time updates don't work
- "EventSource failed" errors

**Solutions:**

1. **Check SSE endpoint**

   ```bash
   curl -N https://api.yourdomain.com/sse?clientId=test
   ```

2. **Verify proxy timeout settings**
   - SSE connections need long timeouts
   - Check Coolify/Traefik configuration

3. **Check nginx timeout (if using nginx)**
   ```nginx
   proxy_read_timeout 3600s;
   proxy_send_timeout 3600s;
   ```

## SSL/Certificate Issues

### SSL Certificate Not Provisioning

**Symptoms:**

- "Connection not secure" warning
- Certificate errors
- Coolify shows certificate provisioning failed

**Solutions:**

1. **Verify DNS is correct**

   ```bash
   # Domain must resolve to server IP
   dig yourdomain.com +short
   ```

2. **Check domain is accessible on HTTP**

   ```bash
   curl http://yourdomain.com
   ```

3. **Check Let's Encrypt rate limits**
   - Limited to 5 failures per hour
   - Wait and try again later

4. **Manual certificate request**
   - In Coolify, trigger manual certificate renewal
   - View logs for errors

### Mixed Content Warnings

**Symptoms:**

- "Mixed content blocked" in browser
- Some resources load over HTTP

**Solutions:**

1. **Ensure all URLs use HTTPS**
   - Check frontend code for `http://` URLs
   - Update VITE_API_URL to use `https://`

2. **Add security headers**
   - Already configured in nginx.conf
   - Verify headers are being sent

## Performance Issues

### High Memory Usage

**Symptoms:**

- Server running out of memory
- Services being killed by OOM

**Solutions:**

1. **Check memory usage**

   ```bash
   docker stats
   free -h
   ```

2. **Identify memory hogs**

   ```bash
   # In app container
   pm2 monit
   ```

3. **Optimize PM2 configuration**
   - Reduce number of instances
   - Set memory limits in ecosystem.config.js:

   ```javascript
   max_memory_restart: "500M";
   ```

4. **Add swap space**
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Slow Response Times

**Symptoms:**

- API requests take >1 second
- Frontend feels sluggish

**Solutions:**

1. **Check server resources**

   ```bash
   top
   htop
   ```

2. **Profile database queries**
   - Enable query logging
   - Identify slow queries
   - Add indexes

3. **Add caching**
   - Redis for frequently accessed data
   - CDN for static assets

4. **Scale horizontally**
   - Increase PM2 instances
   - Deploy multiple app containers

### High CPU Usage

**Symptoms:**

- CPU constantly at 100%
- Server becomes unresponsive

**Solutions:**

1. **Identify CPU-intensive process**

   ```bash
   top
   # Press '1' to see per-core usage
   ```

2. **Check PM2 processes**

   ```bash
   pm2 monit
   ```

3. **Profile application**
   - Use Node.js profiler
   - Identify hot paths
   - Optimize algorithms

4. **Scale server**
   - Upgrade to more CPU cores
   - Distribute load across multiple servers

## Debugging Tools

### Access Container Shell

```bash
# In Coolify, click on a service
# Click "Terminal" or "Shell"
# Or via Docker:
docker exec -it <container-name> sh
```

### Viewing Logs

```bash
# All services
docker-compose -f deployment/docker-compose.prod.yml logs -f

# Specific service
docker-compose -f deployment/docker-compose.prod.yml logs -f app
```

### Check Container Health

```bash
docker ps
# Look at STATUS column for health status
```

### Network Debugging

```bash
# Test connection between containers
docker exec -it app sh
ping postgres
ping rabbitmq
nc -zv postgres 5432
nc -zv rabbitmq 5672
```

### Database Debugging

```bash
# Connect to postgres
docker exec -it <postgres-container> psql -U postgres

# List databases
\l

# Connect to database
\c stalking_service

# List tables
\dt

# Check table schema
\d table_name

# Run query
SELECT * FROM users LIMIT 10;
```

### RabbitMQ Debugging

```bash
# List queues
docker exec -it <rabbitmq-container> rabbitmqctl list_queues

# List connections
docker exec -it <rabbitmq-container> rabbitmqctl list_connections

# Check status
docker exec -it <rabbitmq-container> rabbitmqctl status
```

### PM2 Debugging

```bash
# In app container
pm2 list                 # List all processes
pm2 logs                 # View all logs
pm2 logs app-name        # View specific service logs
pm2 monit               # Real-time monitoring
pm2 describe app-name   # Detailed process info
pm2 restart app-name    # Restart specific service
pm2 reload all          # Reload all services
```

## Getting Help

If you're still stuck:

1. **Check Coolify Logs**
   - View deployment logs
   - Check proxy logs
   - Review service logs

2. **Review Documentation**
   - [Architecture](./architecture.md)
   - [Coolify Deployment](./coolify-deployment.md)
   - [Docker Compose Details](./docker-compose-production.md)

3. **Community Support**
   - Coolify Discord: https://discord.gg/coolify
   - GitHub Issues: Check the repository

4. **Debug Checklist**
   - [ ] All environment variables set
   - [ ] DNS configured correctly
   - [ ] Ports 80/443 open
   - [ ] Services are running
   - [ ] Health checks passing
   - [ ] Logs reviewed for errors
   - [ ] Database initialized
   - [ ] RabbitMQ accessible
   - [ ] SSL certificates valid

## Emergency Recovery

If everything is broken:

1. **Stop all services**

   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

2. **Backup data**

   ```bash
   docker cp <postgres-container>:/var/lib/postgresql/data ./backup
   ```

3. **Clean slate**

   ```bash
   docker-compose -f docker-compose.prod.yml down -v
   docker system prune -a
   ```

4. **Redeploy from scratch**
   - Follow the [Coolify Deployment Guide](./coolify-deployment.md)
   - Restore database if needed
