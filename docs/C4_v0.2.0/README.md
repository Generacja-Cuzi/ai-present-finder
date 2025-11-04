# C4 Architecture Diagrams - v0.2.0

C4 architecture diagrams for the AI Present Finder system.

## Diagrams

- **Context** (`context.puml`) - System boundary, 7 microservices, external systems
- **Container** (`container.puml`) - Technology stack and communication patterns
- **Components** - Internal structure of each microservice:
  - `restapi_component.puml` - REST API + SSE
  - `stalking_component.puml` - Social scraping via BrightData
  - `chat_component.puml` - AI interview flow
  - `gift_ideas_component.puml` - Gift generation orchestration
  - `fetch_component.puml` - E-commerce product fetching
  - `reranking_component.puml` - Product ranking

## Rendering

**VS Code**: Install PlantUML extension, open `.puml` file, press `Alt+D`

**CLI**:

```bash
java -jar plantuml.jar *.puml
```

## Architecture

- **Stack**: NestJS 11, RabbitMQ (AMQP), OpenAI (analysis, gift ideas), Google Gemini (chat interviews, product scoring), BrightData, React + Vite
- **Pattern**: Event-driven CQRS with `@EventPattern` decorators
- **Ports**: REST API (3000), Stalking (3010), Chat (3020), Gift Ideas (3030), Reranking (3091)
