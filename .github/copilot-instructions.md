# Copilot instructions for ai-present-finder

These notes make AI coding agents immediately productive in this repo. Keep edits aligned with the patterns and examples below.

## Architecture at a glance

- Monorepo with pnpm workspaces: backend microservices (NestJS 11 + CQRS + RabbitMQ) and a React frontend.
  - **backend/restapi-macroservice**: HTTP entrypoint + SSE fanout; TypeORM + PostgreSQL; publishes/consumes RMQ events.
  - **backend/stalking-microservice**: consumes StalkingAnalyzeRequestedEvent, scrapes via BrightData, emits StalkingCompletedEvent.
  - **backend/chat-microservice**: drives interview flow (ChatStartInterviewEvent/ChatUserAnsweredEvent), emits ChatQuestionAskedEvent, ChatInterviewCompletedEvent, ChatInappropriateRequestEvent.
  - **backend/gift-ideas-microservice**: consumes StalkingCompletedEvent + ChatInterviewCompletedEvent, emits RegenerateIdeasLoopEvent + GiftContextInitializedEvent.
  - **backend/fetch-microservice**: Multi-instance service (allegro/amazon/ebay/olx); each instance runs with FETCH_PROVIDER env var on different ports (8011-8014); consumes provider-specific FetchEvents, emits ProductFetchedEvent.
  - **backend/reranking-microservice**: consumes ProductFetchedEvent + GiftContextInitializedEvent; filters/reranks gift recommendations; TypeORM + PostgreSQL.
- **Shared packages**: `@core/events` (all event classes), `@core/types` (shared TypeScript types like RecipientProfile).
- RabbitMQ (AMQP) is the backbone. Queue names equal the event class name (EventClass.name) and durability is non‑durable by default.
- **Persistence**: TypeORM with PostgreSQL. Each service has its own database (configured via SERVICE_NAME_DATABASE_URL env vars). Repositories live in `src/data/*.database.repository.ts` and implement interfaces from `src/domain/repositories/i*.repository.ts`.
- Swagger is generated for each service and written to docs/openapi/\*.openapi.json, exposed at /docs.

## Runbook and workflows

- **Prereqs**: Unlock secrets once per clone: `git-crypt unlock ./private_key`. Start infrastructure: `docker compose up` (RabbitMQ admin/admin on localhost:5672, PostgreSQL instances on 5432-5638).
- **Install/build/dev** from root: `pnpm install` → `pnpm dev` (parallel). For single service: `cd backend/<service>` → `pnpm dev`.
- **Database migrations**: From root `pnpm migration:run` (runs all services); per-service `cd backend/<service>` → `pnpm migration:run`.
- **Default ports**: REST 3000, Stalking 3010, Chat 3020, Gift Ideas 3030, Reranking 3091, Fetch (allegro 8012, amazon 8014, ebay 8013, olx 8011); Frontend dev 5713.
- **Swagger UI**: http://localhost:3000/docs (REST), http://localhost:3010/docs (Stalking), http://localhost:3020/docs (Chat), http://localhost:3030/docs (Gift Ideas), http://localhost:3091/docs (Reranking).
- **Production**: Uses single Docker container running all microservices via PM2 (see `deployment/ecosystem.config.cjs`). Single PostgreSQL with multiple databases. Deploy to Coolify (docs in `docs/deployment/`).
- **CI** (Node 22 + pnpm 10): format:check, lint, test, build. Pre-commit hooks via husky + lint-staged run prettier.

## Key patterns and conventions

- Layered per service: src/app (handlers/services), src/domain (commands/events/DTOs), src/webapi (controllers/modules). Example: backend/stalking-microservice/src/app/handlers/stalking-analyze.handler.ts.
- CQRS + RMQ:
  - REST posts in RestApiController dispatch CommandBus commands (e.g., StalkingAnalyzeRequestCommand) that publish RMQ events.
  - Microservices subscribe with @EventPattern(EventClass.name) and publish with ClientProxy.emit(EventClass.name, payload).
  - Configure consumers/producers with Transport.RMQ and queue equal to the event class name. See backend/restapi-macroservice/src/webapi/modules/restapi.module.ts and stalking-microservice/src/webapi/modules/stalking.module.ts.
- SSE fanout lives in REST API at GET /sse?clientId=... (Register/cleanup via SseService). Send user messages to /restapi/send-message; request stalking via /restapi/stalking-request (see RestApiController).
- Config/env: CLOUDAMQP_URL (defaults to amqp://admin:admin@localhost:5672), PORT, SWAGGER_SERVER for docs server URL. Services call ConfigModule.forRoot({ isGlobal: true }).
- **AI Flows** (Vercel AI SDK):
  - Each service with AI logic has `src/app/ai/flow.ts` exporting functions that encapsulate AI calls.
  - **stalking-microservice**: `extractFacts()` uses `generateObject()` with `@ai-sdk/openai` and zod schema to extract keywords from scraped profiles.
  - **chat-microservice**: `giftInterviewFlow()` uses `generateText()` with `@ai-sdk/google` (Gemini), tools, and multi-step execution to conduct conversational interviews.
  - **gift-ideas-microservice**: `giftIdeasFlow()` uses `generateObject()` with `@ai-sdk/openai` to generate gift ideas and search queries based on recipient profile.
  - **reranking-microservice**: `scoreProductsFlow()` uses `generateObject()` with `@ai-sdk/google` to score/rank products against recipient profile.
  - Pattern: flows take structured inputs, call AI SDK with zod schemas, return typed objects. Keep prompts in separate `prompt.ts` files.
- OpenAPI generation is intentional: DocumentBuilder + SwaggerModule.createDocument then write to docs/openapi/<service>.openapi.json and serve /docs.

## When adding or changing functionality

- New event flow: create Event class in domain/events; wire queue in main.ts and/or ClientsModule; use EventClass.name for queue key; keep { durable: false } to match peers.
- New REST endpoint: add to restapi-macroservice/src/webapi/controllers; validate DTOs with zod schemas colocated in domain/models (see sendMessageDtoSchema). Document with @nestjs/swagger decorators.
- New handler: implement @CommandHandler, inject ClientProxy using a named token in the module (see STALKING_COMPLETED_EVENT) and emit the appropriate event.
- Frontend: connect to SSE at /sse using clientId; routes under src/routes; use shadcn via pnpx shadcn@latest add <component> (see frontend/.cursorrules).

## Pointers to exemplars

- **RMQ setup**: `stalking-microservice/src/main.ts`, `restapi-macroservice/src/main.ts` (multiple consumers), `gift-ideas-microservice/src/main.ts` (3 queues), `fetch-microservice/src/main.ts` (dynamic queue per provider).
- **REST + SSE**: `restapi-macroservice/src/webapi/controllers/restapi.controller.ts` and `sse.controller.ts`.
- **CQRS**: `stalking-analyze.handler.ts` and `stalking-analyze-request.handler.ts`; restapi `StalkingAnalyzeRequestCommand`.
- **Repository pattern**: Interface in `src/domain/repositories/ilisting.repository.ts`, implementation in `src/data/listing.database.repository.ts`, wired in module providers.
- **BrightData integration**: `stalking-microservice/src/app/services/brightdata.service.ts` (+ DATASET_MAP) and its tests.
- **Multi-instance pattern**: `fetch-microservice/src/main.ts` reads `FETCH_PROVIDER` env to determine which queue to listen to; root `package.json` scripts spawn 4 instances concurrently.
- **AI flow patterns**: `stalking-microservice/src/app/ai/flow.ts` (simple generateObject), `chat-microservice/src/app/ai/flow.ts` (multi-step tools + retry logic), `gift-ideas-microservice/src/app/ai/flow.ts` (complex prompt composition), `reranking-microservice/src/app/ai/score-products-flow.ts` (batch scoring).

## Guidelines

- Don't write README.md files about new features. The root README.md covers everything.
- **Testing** (Jest + NestJS Testing):
  - Tests live alongside code in `src/` (e.g., `*.spec.ts`) or in dedicated `test/` directories.
  - Minimize mocks: prefer real service instances; only mock external HTTP calls (fetch, axios) and third-party packages.
  - Use NestJS `Test.createTestingModule()` to build test modules with real providers.
  - Mock external services (BrightData, AI flows) at the boundary: mock `fetch` or the imported flow function itself (see `stalking-analyze.handler.spec.ts`).
  - Load real `.env` config in integration tests using `ConfigModule.forRoot({ envFilePath: '.env' })`.
  - Run tests: `pnpm test` (all), `pnpm test:watch` (watch mode), `pnpm test:cov` (coverage).
- Before running commands - always "cd" into the relevant package folder
- **Documentation updates**: When changing events, service boundaries, or data flows:
  - Update AsyncAPI specs in `backend/docs/asyncapi/*.asyncapi.yml`
  - Update C4 diagrams in `docs/C4_v0.2.0/*.puml` (use PlantUML extension in VS Code)
  - Update sequence diagrams in `docs/sequence_diagram/*/` if interaction flow changes
  - Version diagrams by creating new C4_vX.X.X folders for major architecture changes

### **Project Architectural Guidelines & File Structure**

#### **1. Philosophy**

Our project is built on a microservices architecture that values clear separation of concerns. To achieve this, we apply principles from **Clean Architecture**. The most important rule is the **Dependency Rule**: code dependencies must always point from outer layers (like the web API and database) to inner layers (our core business logic). The `domain` should be independent of all other parts.

#### **2. Core Structure: Service & Feature Organization**

Our codebase is organized by service (e.g., `chat-microservice`), and within each service, we organize by feature. The primary entry point for a feature's configuration is its NestJS module file, typically found in `webapi/modules/`.

#### **3. The Architectural Layers**

Within each service's `src` directory, we use the following folder structure to separate our concerns.

##### **`domain` (The Core Business Logic)**

This is the heart of the service. It contains the business rules, models, and events that are central to its purpose. It is pure, framework-agnostic, and has **no external dependencies**.

- **Purpose**: To define the "what" of our business domain.
- **Contents**:
  - `models/`: Core business objects (e.g., `chat-message.ts`). These should be plain classes or interfaces. **Note: DTOs for web requests/responses do not belong here.**
  - `events/`: Domain events that describe significant occurrences (e.g., `chat-interview-completed.event.ts`).
  - `commands/` & `queries/`: Data structures that represent an intent to change the system or request information.
  - **Repository Interfaces**: If persistence is needed, the abstract class or interface for the repository **must be defined here** (e.g., `igift-session.repository.ts`).

##### **`app` (The Application Layer)**

This layer contains the specific logic that orchestrates the domain objects to perform tasks. These are our use cases.

- **Purpose**: To define the "how" of our application's features. It directs the flow of data and calls upon the `domain`.
- **Dependencies**: Depends only on the `domain` layer.
- **Contents**:
  - `handlers/`: These are our **Use Cases**. Each handler should be responsible for a single application action (e.g., `chat-start-interview.handler.ts`). They are triggered by controllers or event listeners.
  - `ai/`, `services/`: Any application-specific services or logic that is needed to carry out a use case.

##### **`webapi` & Infrastructure (The Outer Layer)**

This layer contains all the details for interacting with the outside world, such as our web framework, database connections, and other external services. We group these concerns together.

- **Purpose**: To act as the interface to the outside world and provide concrete implementations for the abstractions defined in the `domain`.
- **Dependencies**: Depends on the `app` and `domain` layers.
- **Contents**:
  - **`webapi/`**: Our primary presentation layer.
    - `controllers/`: NestJS controllers that handle incoming requests. Their only job is to validate input (DTOs), call the correct handler in the `app` layer, and format the response.
    - `modules/`: The NestJS modules that act as our **Composition Root**, wiring all the dependencies together for a feature.
    - `dtos/`: **(New convention)** A dedicated folder for Data Transfer Objects used by the controllers. This keeps them out of the `domain`.
  - **`data/`**: Contains TypeORM database implementations.
    - `*.database.repository.ts`: Concrete repository implementations (e.g., `listing.database.repository.ts` implements `IListingRepository`).
    - `data-source.ts` + `database.config.ts`: TypeORM configuration for migrations.
    - `migrations/`: TypeORM migration files.

#### **4. The Composition Root: The Feature Module**

The NestJS module file (e.g., `webapi/modules/chat.module.ts`) is where we connect the layers. We map the abstract interfaces from the `domain` to the concrete classes from our infrastructure (`persistence`).

```typescript
// src/webapi/modules/chat.module.ts

@Module({
  controllers: [ChatController], // From src/webapi/controllers/
  providers: [
    // All Handlers from src/app/handlers/
    ChatStartInterviewHandler,
    ChatUserAnsweredHandler,

    // The mapping of the domain repository interface to its concrete implementation
    {
      provide: IChatSessionRepository, // The abstraction from src/domain/
      useClass: ChatSessionDbRepository, // The concrete class from src/persistence/
    },
  ],
})
export class ChatModule {}
```

#### **5. Example: Scaffolding a New "Orders" Feature**

When creating a new feature within a service, follow this template:

```plaintext
src/
├── app/
│   └── handlers/
│       └── create-order.handler.ts
├── domain/
│   ├── commands/
│   │   └── create-order.command.ts
│   ├── entities/
│   │   └── order.entity.ts      // TypeORM entity
│   └── repositories/
│       └── iorder.repository.ts
├── data/
│   ├── order.database.repository.ts  // Implements IOrderRepository
│   └── migrations/
└── webapi/
    ├── controllers/
    │   └── order.controller.ts
    ├── dtos/
    │   └── create-order.dto.ts
    └── modules/
        └── order.module.ts
```
