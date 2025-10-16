# C4 Architecture Diagrams - v0.1.0

This directory contains up-to-date C4 architecture diagrams for the AI Present Finder system, rendered using **PlantUML** and the **C4-PlantUML** library.

---

## 📋 Available Diagrams

### Context Diagram (`context.puml`)
Shows the system boundary and interactions with external users and systems:
- User interactions
- 7 microservices (REST API, Stalking, Chat, Gift Ideas, Fetch, Reranking)
- External systems: OpenAI, BrightData, social media platforms (Instagram, TikTok, X)
- E-commerce providers: Allegro, Amazon, eBay, OLX

### Container Diagram (`container.puml`)
Details the high-level technology choices and communication patterns:
- Frontend: React + Vite
- Backend: 6 NestJS microservices + 1 REST API macroservice
- Message Broker: RabbitMQ for event-driven architecture
- Real-time communication: SSE (Server-Sent Events)

### Component Diagrams

#### REST API Macroservice (`restapi_component.puml`)
- HTTP REST endpoints (`/restapi/stalking-request`, `/restapi/send-message`)
- SSE endpoint for real-time updates
- CQRS command handlers
- Event consumers and publishers

#### Stalking Microservice (`stalking_component.puml`)
- Consumes: `StalkingAnalyzeRequestedEvent`
- Services: BrightData scraping, AI content analysis
- Publishes: `StalkingCompletedEvent`

#### Chat Microservice (`chat_component.puml`)
- Consumes: `ChatStartInterviewEvent`, `ChatUserAnsweredEvent`
- Services: OpenAI-powered interview question generation
- Publishes: `ChatQuestionAskedEvent`, `ChatInterviewCompletedEvent`, `ChatInappropriateRequestEvent`

#### Gift Ideas Microservice (`gift_ideas_component.puml`)
- Consumes: `StalkingCompletedEvent`, `ChatInterviewCompletedEvent`
- Services: OpenAI-powered gift idea generation
- Publishes: `GiftContextInitializedEvent`, `FetchAllegroEvent`, `FetchAmazonEvent`, `FetchEbayEvent`, `FetchOlxEvent`

#### Fetch Microservice (`fetch_component.puml`)
- Consumes: `FetchAllegroEvent`, `FetchAmazonEvent`, `FetchEbayEvent`, `FetchOlxEvent`
- Services: Product fetching from multiple e-commerce APIs
- Publishes: `ProductFetchedEvent`

#### Reranking Microservice (`reranking_component.puml`)
- Consumes: `GiftContextInitializedEvent`, `ProductFetchedEvent`
- Services: Product reranking and filtering
- Publishes: `GiftReadyEvent`

---

## 📦 Requirements

- **Java 8+** – required to run PlantUML
- **Graphviz** – for graph rendering
  - Linux: `sudo apt install graphviz`
  - macOS: `brew install graphviz`
  - Windows: download from [graphviz.org/download](https://graphviz.org/download/) and add to PATH
- **Visual Studio Code** with [PlantUML extension (jebbs.plantuml)](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)

Optional:

- **PlantUML** – download `plantuml.jar` from [plantuml.com/download](https://plantuml.com/download)

---

## 🚀 Rendering Diagrams

### 1. Using VS Code

1. Open the project in **Visual Studio Code**.
2. Install the **PlantUML** extension.
3. Ensure Graphviz is installed on your system.
4. Open any `.puml` file and press `Alt+D` to preview the diagram.
5. Alternatively, right-click on the file and select **PlantUML: Export Current Diagram** → PNG / SVG.

---

### 2. Command Line Rendering

```bash
# Generate PNG
java -jar plantuml.jar context.puml

# Generate SVG
java -jar plantuml.jar -tsvg context.puml

# Generate all diagrams
java -jar plantuml.jar *.puml
```

---

## 🏗️ Architecture Notes

### Event-Driven Communication
All microservices communicate via RabbitMQ using the CQRS pattern:
- Queue names equal the event class name (e.g., `StalkingAnalyzeRequestedEvent`)
- Events are defined in `core/events` workspace
- Handlers use `@EventPattern(EventClassName.name)` decorator
- Publishers use `ClientProxy.emit(EventClassName.name, payload)`

### Service Ports
- REST API Macroservice: 3000
- Stalking Microservice: 3010
- Chat Microservice: 3020
- Gift Ideas Microservice: 3030
- Reranking Microservice: 3091
- Fetch Microservice: No HTTP port (RabbitMQ only)

### Technology Stack
- **Backend**: NestJS 11 with CQRS pattern
- **Message Broker**: RabbitMQ (AMQP)
- **AI/LLM**: OpenAI via ai-sdk
- **Scraping**: BrightData proxy service
- **Frontend**: React + Vite
- **Real-time Updates**: Server-Sent Events (SSE)
