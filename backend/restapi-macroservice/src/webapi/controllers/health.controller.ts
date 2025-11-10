import { Controller, Get, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";

import { RabbitMQHealthIndicator } from "../../app/health/rabbitmq.health";

/**
 * Health check controller for monitoring service dependencies.
 * Provides endpoints for Docker health checks, Kubernetes probes, and monitoring systems.
 */
@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: TypeOrmHealthIndicator,
    private readonly rabbitmq: RabbitMQHealthIndicator,
    @Inject("STALKING_ANALYZE_REQUESTED_EVENT")
    private readonly stalkingClient: ClientProxy,
    @Inject("CHAT_START_INTERVIEW_EVENT")
    private readonly chatClient: ClientProxy,
  ) {}

  /**
   * Comprehensive health check including all dependencies.
   * Returns 200 if all checks pass, 503 if any fail.
   */
  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: "Comprehensive health check",
    description:
      "Checks database and RabbitMQ connectivity. Returns 503 if any dependency is unhealthy.",
  })
  @ApiOkResponse({
    description: "Service is healthy",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        info: {
          type: "object",
          properties: {
            database: {
              type: "object",
              properties: { status: { type: "string", example: "up" } },
            },
            rabbitmq: {
              type: "object",
              properties: { status: { type: "string", example: "up" } },
            },
          },
        },
        error: { type: "object" },
        details: {
          type: "object",
          properties: {
            database: {
              type: "object",
              properties: { status: { type: "string", example: "up" } },
            },
            rabbitmq: {
              type: "object",
              properties: { status: { type: "string", example: "up" } },
            },
          },
        },
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: "Service is unhealthy",
  })
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => this.database.pingCheck("database"),
      async () => this.rabbitmq.isHealthy("rabbitmq", this.stalkingClient),
    ]);
  }

  /**
   * Readiness probe - checks if the service is ready to accept traffic.
   * All dependencies must be operational.
   */
  @Get("readiness")
  @HealthCheck()
  @ApiOperation({
    summary: "Readiness probe",
    description:
      "Kubernetes-style readiness probe. Checks if service is ready to handle requests.",
  })
  @ApiOkResponse({ description: "Service is ready" })
  @ApiServiceUnavailableResponse({ description: "Service is not ready" })
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => this.database.pingCheck("database"),
      async () => this.rabbitmq.isHealthy("rabbitmq", this.stalkingClient),
    ]);
  }

  /**
   * Liveness probe - checks if the service is alive.
   * Only checks if the application is running, not dependencies.
   */
  @Get("liveness")
  @ApiOperation({
    summary: "Liveness probe",
    description:
      "Kubernetes-style liveness probe. Checks if application is running.",
  })
  @ApiOkResponse({
    description: "Service is alive",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        info: { type: "object" },
        error: { type: "object" },
        details: { type: "object" },
      },
    },
  })
  liveness(): { status: string } {
    // Simple check - if we can respond, we're alive
    return { status: "ok" };
  }

  /**
   * Database-only health check.
   */
  @Get("database")
  @HealthCheck()
  @ApiOperation({
    summary: "Database health check",
    description: "Checks PostgreSQL database connectivity only.",
  })
  @ApiOkResponse({ description: "Database is healthy" })
  @ApiServiceUnavailableResponse({ description: "Database is unhealthy" })
  async checkDatabase(): Promise<HealthCheckResult> {
    return this.health.check([async () => this.database.pingCheck("database")]);
  }

  /**
   * RabbitMQ-only health check.
   */
  @Get("rabbitmq")
  @HealthCheck()
  @ApiOperation({
    summary: "RabbitMQ health check",
    description: "Checks RabbitMQ message broker connectivity only.",
  })
  @ApiOkResponse({ description: "RabbitMQ is healthy" })
  @ApiServiceUnavailableResponse({ description: "RabbitMQ is unhealthy" })
  async checkRabbitMQ(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => this.rabbitmq.isHealthy("rabbitmq", this.stalkingClient),
    ]);
  }
}
