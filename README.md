# Gift AI Present Finder

An intelligent present finder application built with microservices architecture.

## Architecture

The application consists of the following microservices:

### Core Services

- **REST API Macroservice** (Port 3000) - Main API gateway
- **Gift Microservice** (Port 3001) - Coordinates product searches across platforms
- **Chat Microservice** (Port 3002) - AI-powered chat functionality
- **Stalking Microservice** (Port 3010) - User behavior analysis

### Platform Integration Services

- **OLX Microservice** (Port 3020) - Searches OLX listings
- **Allegro Microservice** (Port 3021) - Searches Allegro listings
- **Amazon Microservice** (Port 3022) - Searches Amazon listings
- **eBay Microservice** (Port 3023) - Searches eBay listings

### Infrastructure

- **RabbitMQ** (Ports 5672, 15672) - Message broker for service communication

## Setup

1. Configure environment variables in `backend/chat-microservice/.env` and add your OPENAI API KEY.

2. Install dependencies and run the application:

```shell
pnpm i
docker compose up
pnpm dev
```

## API Documentation

Each microservice provides its own Swagger documentation:

- OLX API: http://localhost:3020/docs
- Allegro API: http://localhost:3021/docs
- Amazon API: http://localhost:3022/docs
- eBay API: http://localhost:3023/docs
- Gift API: http://localhost:3001/docs
- Chat API: http://localhost:3002/docs
- Stalking API: http://localhost:3010/docs
- Main API: http://localhost:3000/docs

## Development

The project uses a monorepo structure with pnpm workspaces. Each microservice is independently deployable and scalable.
