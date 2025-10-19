# Production Architecture

## Overview

The AI Present Finder production deployment is optimized for cost-effectiveness and simplicity while maintaining the microservices architecture internally.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Coolify                              │
│  ┌────────────────┐              ┌──────────────────────┐   │
│  │   Frontend     │              │   App Container      │   │
│  │   (Nginx)      │◄─────────────┤   (All Services)     │   │
│  │   Port 80      │              │   Port 3000          │   │
│  └────────────────┘              └──────────────────────┘   │
│                                            │                 │
│                                            │                 │
│  ┌────────────────┐              ┌──────────────────────┐   │
│  │   PostgreSQL   │◄─────────────┤   RabbitMQ           │   │
│  │   (5 DBs)      │              │   Port 5672          │   │
│  └────────────────┘              └──────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Container Architecture

### App Container

A single Docker container running multiple Node.js processes managed by PM2:

```
┌────────────────────────────────────────────────────┐
│          App Container (Node 22 Alpine)            │
├────────────────────────────────────────────────────┤
│                    PM2 Process Manager             │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  restapi-macroservice        Port 3000       │ │
│  │  ├─ HTTP/REST API                            │ │
│  │  └─ SSE (Server-Sent Events)                 │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  stalking-microservice       Port 3010       │ │
│  │  └─ User data analysis via BrightData        │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  chat-microservice           Port 3020       │ │
│  │  └─ Interview flow (OpenAI)                  │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  gift-microservice           Port 3030       │ │
│  │  └─ Gift generation logic                    │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  gift-ideas-microservice     Port 3040       │ │
│  │  └─ AI-powered gift suggestions              │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  reranking-microservice      Port 3050       │ │
│  │  └─ Gift ranking and filtering               │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  fetch-microservice-olx      Port 8011       │ │
│  │  fetch-microservice-allegro  Port 8012       │ │
│  │  fetch-microservice-ebay     Port 8013       │ │
│  │  fetch-microservice-amazon   Port 8014       │ │
│  │  └─ Product fetching from various platforms  │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

### Communication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │────────▶│ Frontend │────────▶│   REST   │
│          │◀────────│ (Nginx)  │◀────────│   API    │
└──────────┘         └──────────┘         └──────────┘
                                                │
                                                ▼
                        ┌────────────────────────────────┐
                        │        RabbitMQ Queues         │
                        │  ┌──────────────────────────┐  │
                        │  │ StalkingAnalyzeRequested │  │
                        │  │ ChatStartInterview       │  │
                        │  │ ChatUserAnswered         │  │
                        │  │ GiftGenerateRequested    │  │
                        │  │ ...                      │  │
                        │  └──────────────────────────┘  │
                        └────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌────────────┐  ┌────────────┐  ┌────────────┐
            │ Stalking   │  │   Chat     │  │   Gift     │
            │ Service    │  │  Service   │  │  Service   │
            └────────────┘  └────────────┘  └────────────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    ▼
                        ┌────────────────────────┐
                        │     PostgreSQL         │
                        │  ┌──────────────────┐  │
                        │  │ stalking_service │  │
                        │  │ chat_service     │  │
                        │  │ gift_ideas_svc   │  │
                        │  │ reranking_svc    │  │
                        │  │ fetch_service    │  │
                        │  └──────────────────┘  │
                        └────────────────────────┘
```

## Data Flow

### 1. User Interaction Flow

```
User → Frontend → REST API → SSE Connection
                      │
                      ├─ Publish: StalkingAnalyzeRequestedEvent
                      ├─ Publish: ChatStartInterviewEvent
                      └─ Stream updates via SSE
```

### 2. Event Processing Flow

```
RabbitMQ Queue → Microservice Handler → Database Write
                                    └─ Emit new event → RabbitMQ
```

### 3. Real-time Updates Flow

```
Microservice → Publish Event → RabbitMQ
                                   │
                                   ▼
                            REST API subscribes
                                   │
                                   ▼
                            Push via SSE → Frontend
```

## Database Structure

Single PostgreSQL instance with isolated databases:

```
PostgreSQL Instance (postgres:16)
├── reranking_service
│   └── User: reranking_user
├── fetch_service
│   └── User: fetch_user
├── stalking_service
│   └── User: stalking_user
├── chat_service
│   └── User: chat_user
└── gift_ideas_service
    └── User: gift_ideas_user
```

## Message Queue Structure

RabbitMQ queues (non-durable):

```
RabbitMQ
├── StalkingAnalyzeRequestedEvent
├── StalkingCompletedEvent
├── ChatStartInterviewEvent
├── ChatQuestionAskedEvent
├── ChatUserAnsweredEvent
├── ChatInterviewCompletedEvent
├── ChatInappropriateRequestEvent
├── GiftGenerateRequestedEvent
├── GiftReadyEvent
└── ... (other events)
```

Queue names match the event class name (`EventClass.name`).

## Network Architecture

### Internal Networking

All services communicate via Docker's internal network:

- **Service-to-Service**: `http://<service-name>:<port>`
- **Database**: `postgresql://<user>:<pass>@postgres:5432/<db>`
- **RabbitMQ**: `amqp://admin:admin@rabbitmq:5672`

### External Access (via Coolify)

Coolify provides the reverse proxy:

```
Internet
    │
    ▼
┌─────────────────┐
│  Coolify Proxy  │
│   (Traefik)     │
└─────────────────┘
    │         │
    │         └──────────────┐
    ▼                        ▼
┌──────────┐         ┌──────────────┐
│ Frontend │         │ App (REST)   │
│  Port 80 │         │  Port 3000   │
└──────────┘         └──────────────┘
```

## Scaling Strategy

### Current Setup (Single Container)

**Pros:**

- Low resource usage
- Fast inter-service communication (localhost)
- Simple deployment
- Cost-effective

**Cons:**

- Single point of failure
- Vertical scaling only
- All services restart together

### Future Scaling Options

#### Option 1: Horizontal Scaling with External Services

Move RabbitMQ and PostgreSQL to external services:

```
┌────────┐  ┌────────┐  ┌────────┐
│ App 1  │  │ App 2  │  │ App 3  │
└───┬────┘  └───┬────┘  └───┬────┘
    └───────────┼───────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │  RabbitMQ    │
│  (Managed)   │  │  (Managed)   │
└──────────────┘  └──────────────┘
```

#### Option 2: Service Separation

Split into multiple containers:

```
┌──────────┐
│  REST    │
│  API     │
└──────────┘
     │
┌────┴─────┬─────────┬──────────┐
▼          ▼         ▼          ▼
┌────┐  ┌────┐  ┌──────┐  ┌──────┐
│Chat│  │Gift│  │Stalk │  │Fetch │
└────┘  └────┘  └──────┘  └──────┘
```

## Resource Requirements

### Minimum (Development)

- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 10 GB

### Recommended (Production - Light Load)

- **CPU**: 4 cores
- **RAM**: 8 GB
- **Storage**: 20 GB SSD

### Recommended (Production - Medium Load)

- **CPU**: 8 cores
- **RAM**: 16 GB
- **Storage**: 50 GB SSD

## Security Architecture

### Network Security

- No exposed ports (Coolify handles ingress)
- Internal Docker network for service communication
- Database access restricted to app container

### Application Security

- Environment variable-based secrets
- No hardcoded credentials
- HTTPS enforced by Coolify
- Security headers in Nginx

### Database Security

- Separate users per service
- Isolated databases
- Strong passwords required

## Monitoring Points

### Health Checks

- **App Container**: HTTP GET to `http://localhost:3000/health`
- **PostgreSQL**: `pg_isready -U postgres`
- **RabbitMQ**: `rabbitmq-diagnostics -q ping`
- **Frontend**: HTTP GET to `http://localhost/health`

### Key Metrics to Monitor

1. **CPU Usage**: All services in app container
2. **Memory Usage**: App container, PostgreSQL, RabbitMQ
3. **Disk I/O**: PostgreSQL volume
4. **Network**: RabbitMQ message throughput
5. **Response Times**: REST API endpoints
6. **Error Rates**: Application logs
7. **Queue Depths**: RabbitMQ queues

## Backup Strategy

### Database Backups

```bash
# Automated daily backups
pg_dump -U postgres <database_name> > backup-$(date +%Y%m%d).sql
```

### Volume Backups

- `postgres_data` → Daily backups
- `rabbitmq_data` → Weekly backups (optional)

## Disaster Recovery

### Recovery Time Objective (RTO)

- Target: < 30 minutes

### Recovery Point Objective (RPO)

- Target: < 24 hours (daily backups)

### Recovery Process

1. Provision new Coolify instance
2. Restore database from backup
3. Deploy docker-compose.prod.yml
4. Restore environment variables
5. Assign domains and verify

## Performance Optimization

### Application Level

- PM2 cluster mode for CPU-bound tasks
- Connection pooling for PostgreSQL
- RabbitMQ prefetch limits

### Database Level

- Indexes on frequently queried fields
- Connection pooling
- Query optimization

### Caching Strategy

- Static assets cached by Nginx (1 year)
- Database query caching (application level)
- CDN for static assets (optional)

## Cost Optimization

### Current Architecture Benefits

1. **Single container** reduces compute costs
2. **Single PostgreSQL** instance instead of 5
3. **Efficient resource usage** with PM2
4. **No managed services** required

### Estimated Costs (Monthly)

- **Small Instance** (2 CPU, 4GB RAM): $10-20
- **Medium Instance** (4 CPU, 8GB RAM): $40-60
- **Large Instance** (8 CPU, 16GB RAM): $80-120

Plus:

- Domain + SSL: $0 (Let's Encrypt)
- Coolify: $0 (self-hosted)
- External APIs: Variable (OpenAI, BrightData)
