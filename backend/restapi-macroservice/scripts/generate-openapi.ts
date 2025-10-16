import * as fs from "node:fs";
// eslint-disable-next-line unicorn/import-style -- idk why but it's not working otherwise
import * as path from "node:path";

import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AppModule } from "../src/app.module";

async function generateOpenApiSpec() {
  console.log("Generating OpenAPI spec for restapi-macroservice...");

  let app: NestFastifyApplication | null | undefined;
  try {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter()) as unknown as
      | NestFastifyApplication
      | null
      | undefined;

    if (app == null) {
      throw new Error("Failed to create Nest application");
    }
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    const port = Number(process.env.PORT ?? 3000);
    const portString = String(port);

    const swaggerServer =
      process.env.SWAGGER_SERVER ?? `http://localhost:${portString}`;

    const config = new DocumentBuilder()
      .setTitle("AI Present Finder - REST API")
      .setDescription(
        "REST API for interacting with microservices: stalking requests, sending chat messages and streaming events via SSE.",
      )
      .setVersion("1.0")
      .addServer(swaggerServer)
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Ensure output directory exists
    const outputFile = "docs/openapi/restapi-macroservice.openapi.json";
    const outputDirectory = path.dirname(outputFile);
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    // Write the OpenAPI spec to file
    fs.writeFileSync(outputFile, JSON.stringify(document, null, 2));
    console.log(`✅ Generated OpenAPI spec at ${outputFile}`);
  } finally {
    if (app != null) {
      await app.close();
    }
  }
}

// Run the script
generateOpenApiSpec().catch((error: unknown) => {
  console.error("💥 Script failed:", error);
  throw error;
});
