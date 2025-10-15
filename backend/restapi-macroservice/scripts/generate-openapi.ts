#!/usr/bin/env tsx
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "../src/app.module.js";

async function generateOpenAPI(): Promise<void> {
  console.log("🚀 Generating OpenAPI documentation...");

  try {
    // Create a minimal app instance for OpenAPI generation
    const app = await NestFactory.create(AppModule, { logger: false });

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

    const outputDirectory = "docs/openapi";
    if (!existsSync(outputDirectory)) {
      mkdirSync(outputDirectory, { recursive: true });
    }

    const outputPath = `${outputDirectory}/restapi-macroservice.openapi.json`;
    writeFileSync(outputPath, JSON.stringify(document, null, 2));

    console.log(`✅ OpenAPI documentation generated: ${outputPath}`);

    await app.close();
  } catch (error) {
    console.error("❌ Error generating OpenAPI documentation:", error);
    process.exit(1);
  }
}

void generateOpenAPI();
