# AsyncAPI specs for microservices

Location: `docs/asyncapi/` contains AsyncAPI YAML files describing event channels used across microservices.

Included specs:

- `chat-microservice.asyncapi.yml` - channels: `ChatQuestionAskedEvent`, `ChatInterviewCompletedEvent`, `ChatInappropriateRequestEvent`.
- `gift-microservice.asyncapi.yml` - channels: `GiftGenerateRequestedEvent`, `GiftReadyEvent`.
- `restapi-macroservice.asyncapi.yml` - all published/subscribed events used by the REST API macroservice and references to other specs.
- `stalking-microservice.asyncapi.yml` - channels: `StalkingAnalyzeRequestedEvent`, `StalkingCompletedEvent`.

Notes & Recommendations:

- Transport: the code uses RabbitMQ (AMQP). Specs use `amqp` server URL placeholder `${CLOUDAMQP_URL}` mirroring the apps.
- Queue names: channels are named after event class names used in code (e.g., `GiftGenerateRequestedEvent`).
- Schemas: message payloads were inferred from domain event classes and model DTOs in the codebase. They are simplified JSON Schema objects — adjust types and required fields if your code enforces additional constraints.
- SSE: `restapi-macroservice` exposes Server-Sent Events to the frontend; this is HTTP-based and not modeled as AMQP in the specs (see the `sse` tag in that spec).

How to validate and view specs:

1. Install AsyncAPI CLI (optional):

```bash
# install globally
npm install -g @asyncapi/cli
```

2. Validate a spec:

```bash
asyncapi validate docs/asyncapi/restapi-macroservice.asyncapi.yml
```

3. View generated documentation locally:

```bash
asyncapi preview docs/asyncapi/restapi-macroservice.asyncapi.yml
# or generate static HTML
asyncapi generate fromFile docs/asyncapi/restapi-macroservice.asyncapi.yml @asyncapi/html-template -o docs/asyncapi/html/restapi
```

Next steps I suggest:

- Review the message schemas and add missing fields or mark required properties explicitly.
- If you use security (JWT, API keys) for event producers/consumers, add `securitySchemes` to each spec and reference them.
- Optionally generate client bindings or documentation using `asyncapi` generator.
