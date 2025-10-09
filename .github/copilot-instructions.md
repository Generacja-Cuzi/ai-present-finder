# Copilot instructions for ai-present-finder

These notes make AI coding agents immediately productive in this repo. Keep edits aligned with the patterns and examples below.

## Architecture at a glance

- Monorepo with pnpm workspaces: backend microservices (NestJS 11 + CQRS + RabbitMQ) and a React frontend.
  - backend/restapi-macroservice: HTTP entrypoint + SSE fanout; publishes/consumes RMQ events.
  - backend/stalking-microservice: consumes StalkingAnalyzeRequestedEvent, scrapes via BrightData, emits StalkingCompletedEvent.
  - backend/chat-microservice: drives interview flow (ChatStartInterviewEvent/ChatUserAnsweredEvent), emits ChatQuestionAskedEvent, ChatInterviewCompletedEvent, ChatInappropriateRequestEvent.
  - backend/gift-microservice: consumes GiftGenerateRequestedEvent, emits GiftReadyEvent.
- RabbitMQ (AMQP) is the backbone. Queue names equal the event class name (EventClass.name) and durability is non‑durable by default.
- Swagger is generated for each service and written to docs/openapi/\*.openapi.json, exposed at /docs.

## Runbook and workflows

- Prereqs: unlock secrets once per clone (git-crypt unlock ./private_key). Start RabbitMQ: docker compose up (uses admin/admin on localhost:5672).
- Install/build/dev from the root: pnpm install; pnpm dev (parallel) or cd into a service and pnpm dev; pnpm build; pnpm test.
- Default ports: REST 3000, Stalking 3010, Chat 3020, Gift 3030; Frontend dev 5713.
- Swagger UI: http://localhost:3000/docs (REST), http://localhost:3010/docs (Stalking), http://localhost:3020/docs (Chat), http://localhost:3030/docs (Gift).
- CI runs format:check, lint, test, build on Node 22 with pnpm 10.

## Key patterns and conventions

- Layered per service: src/app (handlers/services), src/domain (commands/events/DTOs), src/webapi (controllers/modules). Example: backend/stalking-microservice/src/app/handlers/stalking-analyze.handler.ts.
- CQRS + RMQ:
  - REST posts in RestApiController dispatch CommandBus commands (e.g., StalkingAnalyzeRequestCommand) that publish RMQ events.
  - Microservices subscribe with @EventPattern(EventClass.name) and publish with ClientProxy.emit(EventClass.name, payload).
  - Configure consumers/producers with Transport.RMQ and queue equal to the event class name. See backend/restapi-macroservice/src/webapi/modules/restapi.module.ts and stalking-microservice/src/webapi/modules/stalking.module.ts.
- SSE fanout lives in REST API at GET /sse?clientId=... (Register/cleanup via SseService). Send user messages to /restapi/send-message; request stalking via /restapi/stalking-request (see RestApiController).
- Config/env: CLOUDAMQP_URL (defaults to amqp://admin:admin@localhost:5672), PORT, SWAGGER_SERVER for docs server URL. Services call ConfigModule.forRoot({ isGlobal: true }).
- AI usage: ai-sdk + @ai-sdk/openai in stalking-microservice/src/app/ai/flow.ts with generateObject and zod schema. OpenAI key expected via .env in chat-microservice per root README.
- OpenAPI generation is intentional: DocumentBuilder + SwaggerModule.createDocument then write to docs/openapi/<service>.openapi.json and serve /docs.

## When adding or changing functionality

- New event flow: create Event class in domain/events; wire queue in main.ts and/or ClientsModule; use EventClass.name for queue key; keep { durable: false } to match peers.
- New REST endpoint: add to restapi-macroservice/src/webapi/controllers; validate DTOs with zod schemas colocated in domain/models (see sendMessageDtoSchema). Document with @nestjs/swagger decorators.
- New handler: implement @CommandHandler, inject ClientProxy using a named token in the module (see STALKING_COMPLETED_EVENT) and emit the appropriate event.
- Frontend: connect to SSE at /sse using clientId; routes under src/routes; use shadcn via pnpx shadcn@latest add <component> (see frontend/.cursorrules).

## Pointers to exemplars

- RMQ setup: stalking-microservice/src/main.ts, restapi-macroservice/src/main.ts (multiple consumers), gift-microservice/src/main.ts.
- REST + SSE: restapi-macroservice/src/webapi/controllers/restapi.controller.ts and sse.controller.ts.
- CQRS: stalking-analyze.handler.ts and stalking-analyze-request.handler.ts; restapi StalkingAnalyzeRequestCommand.
- BrightData integration: stalking-microservice/src/app/services/brightdata.service.ts (+ DATASET_MAP) and its tests.

Questions or gaps? Tell me what’s unclear and I’ll refine these instructions.
