# C4 Diagram Update Summary - v0.0.1 → v0.1.0

This document summarizes the changes made to the C4 architecture diagrams to reflect the current state of the AI Present Finder system.

## Major Changes

### Microservices Architecture

**Added (New in v0.1.0):**
- **Fetch Microservice** - Dedicated service for fetching products from multiple e-commerce providers
- **Reranking Microservice** - Aggregates and reranks products from all providers
- **Component diagrams** - 6 detailed component diagrams for all major services

**Updated:**
- **Gift Microservice** → **Gift Ideas Microservice** - Clarified name and responsibilities
- **REST API Macroservice** - Added SSE (Server-Sent Events) for real-time updates

### External Systems

**Removed:**
- Temu - Not used in current implementation
- AliExpress - Not used in current implementation
- Facebook - Not currently scraped
- YouTube - Not currently scraped
- LinkedIn - Not currently scraped
- Threads - Not currently scraped

**Updated:**
- **LLM Integration** - Unified as OpenAI (was split into Chatbot LLM, Vision LLM, Gift LLM)
- **Scraping** - Explicitly shows BrightData as the scraping proxy service

**Current Providers:**
- Allegro ✓
- Amazon ✓ (disabled in production but code exists)
- eBay ✓
- OLX ✓

**Current Social Platforms:**
- Instagram ✓
- TikTok ✓
- X (Twitter) ✓

### Technology Stack Corrections

**Frontend:**
- ~~Next.js~~ → **React + Vite** (correct as per actual implementation)

**Communication:**
- Added **RabbitMQ** as central message broker for event-driven architecture
- Added **SSE** for real-time user notifications

### Architecture Pattern

**Event-Driven with CQRS:**
- All microservices communicate via RabbitMQ events
- Queue names equal event class names
- Events defined in shared `core/events` workspace
- CQRS pattern with CommandBus and EventPattern decorators

### New Diagrams in v0.1.0

1. **Container Diagram** (`container.puml`) - Shows all 7 services and RabbitMQ
2. **REST API Component** (`restapi_component.puml`) - HTTP endpoints, SSE, event handling
3. **Stalking Component** (`stalking_component.puml`) - BrightData integration, AI analysis
4. **Chat Component** (`chat_component.puml`) - Interview flow with OpenAI
5. **Gift Ideas Component** (`gift_ideas_component.puml`) - Gift generation orchestration
6. **Fetch Component** (`fetch_component.puml`) - Multi-provider product fetching
7. **Reranking Component** (`reranking_component.puml`) - Product aggregation and ranking

## Event Flow (Simplified)

```
1. User → REST API: POST /restapi/stalking-request
2. REST API → Stalking: StalkingAnalyzeRequestedEvent
3. REST API → Chat: ChatStartInterviewEvent
4. Stalking → Gift Ideas: StalkingCompletedEvent
5. Chat ↔ REST API ↔ User: Interview questions/answers
6. Chat → Gift Ideas: ChatInterviewCompletedEvent
7. Gift Ideas → Reranking: GiftContextInitializedEvent
8. Gift Ideas → Fetch: FetchAllegroEvent, FetchAmazonEvent, FetchEbayEvent, FetchOlxEvent
9. Fetch → Reranking: ProductFetchedEvent (from each provider)
10. Reranking → REST API: GiftReadyEvent
11. REST API → User: SSE notification with gift recommendations
```

## Service Ports

| Service | Port | HTTP Exposed |
|---------|------|--------------|
| REST API Macroservice | 3000 | ✓ |
| Stalking Microservice | 3010 | ✓ (Swagger) |
| Chat Microservice | 3020 | ✓ (Swagger) |
| Gift Ideas Microservice | 3030 | ✓ (Swagger) |
| Reranking Microservice | 3091 | ✓ (Swagger) |
| Fetch Microservice | - | ✗ (RabbitMQ only) |

## Files Updated

- `docs/C4_v0.1.0/context.puml` - Updated with current architecture
- `docs/C4_v0.1.0/container.puml` - NEW: Container diagram
- `docs/C4_v0.1.0/restapi_component.puml` - NEW: REST API components
- `docs/C4_v0.1.0/stalking_component.puml` - NEW: Stalking components
- `docs/C4_v0.1.0/chat_component.puml` - NEW: Chat components
- `docs/C4_v0.1.0/gift_ideas_component.puml` - NEW: Gift Ideas components
- `docs/C4_v0.1.0/fetch_component.puml` - NEW: Fetch components
- `docs/C4_v0.1.0/reranking_component.puml` - NEW: Reranking components
- `docs/C4_v0.1.0/README.md` - Updated with comprehensive documentation

All diagrams include corresponding PNG images for easy viewing.
