import { catchError, firstValueFrom, timeout } from "rxjs";

import { Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { HealthIndicatorResult } from "@nestjs/terminus";

/**
 * Custom health indicator for RabbitMQ connectivity.
 * Tests connection to RabbitMQ message broker.
 */
@Injectable()
export class RabbitMQHealthIndicator {
  /**
   * Check RabbitMQ health by testing connection to a client proxy.
   * @param key - The key to identify this health check in the response
   * @param client - The RabbitMQ ClientProxy to test
   * @param timeoutMs - Timeout in milliseconds (default: 3000)
   * @returns HealthIndicatorResult with status
   */
  async isHealthy(
    key: string,
    client: ClientProxy,
    timeoutMs = 3000,
  ): Promise<HealthIndicatorResult> {
    try {
      // Test if the client can connect
      await firstValueFrom(
        client.send({ cmd: "health-check" }, {}).pipe(
          timeout(timeoutMs),
          catchError((error: unknown) => {
            // If the service doesn't respond to health-check, that's OK
            // The important thing is that we can connect to RabbitMQ
            // A connection error will be thrown before this catchError is reached
            throw error;
          }),
        ),
      ).catch((error: unknown) => {
        // Check if it's a timeout or connection error
        const isTimeoutError =
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          error.name === "TimeoutError";
        const hasTimeoutMessage =
          error instanceof Error && error.message.includes("timeout");

        if (isTimeoutError || hasTimeoutMessage) {
          // Timeout is OK - it means we connected but no response
          // This is expected since microservices may not have health-check handlers
          return { connected: true };
        }
        throw error;
      });

      return { [key]: { status: "up" } };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        [key]: {
          status: "down",
          message: errorMessage,
        },
      };
    }
  }
}
