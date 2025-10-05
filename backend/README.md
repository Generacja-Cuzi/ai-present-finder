# Backend — API documentation setup

This backend now includes OpenAPI (Swagger) support for the microservices that expose HTTP endpoints.

Services with Swagger UI:

- restapi-macroservice — HTTP endpoints for stalking requests, sending chat messages, SSE
- gift-microservice — endpoints for searching gift listings (OLX, eBay, Amazon)
- stalking-microservice — endpoints related to stalking analyze requests
- chat-microservice — chat-related HTTP endpoints (if any)

Quick setup

1. Install new Swagger dependencies into the services (uses pnpm workspaces):

```bash
pnpm -w add @nestjs/swagger@^6.1.2 swagger-ui-express@^4.6.3 --filter ./restapi-macroservice --filter ./stalking-microservice --filter ./gift-microservice --filter ./chat-microservice
```

Or use the helper script from the backend package.json:

```bash
pnpm -w --filter ./backend run install:swagger
```

2. Start the service you want to inspect (for example restapi):

```bash
cd backend/restapi-macroservice
pnpm install
pnpm run start:dev
```

3. Open Swagger UI in your browser:

- http://localhost:3000/docs (restapi-macroservice default port)
- http://localhost:3010/docs (stalking-microservice)
- http://localhost:3020/docs (chat-microservice)
- http://localhost:3030/docs (gift-microservice)

Notes

- On first run each service writes its OpenAPI JSON to `docs/openapi/<service>.openapi.json`.
- The code uses `@nestjs/swagger` decorators to expose DTOs with human-readable descriptions and examples.
- If you prefer to keep validation in Zod, the zod schemas are preserved and used for runtime validation.

If you'd like, I can:

- Add a small script to aggregate the individual OpenAPI JSON files into a single combined API gateway doc.
- Add automated generation to CI so the JSON files are produced on each build.
