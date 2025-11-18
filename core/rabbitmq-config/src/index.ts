/**
 * Centralized RabbitMQ configuration utilities
 * Prevents memory leaks from anonymous queues and improves performance
 */
import { RmqOptions, Transport } from "@nestjs/microservices";

export interface RabbitMQConsumerConfig {
  queue: string;
  /**
   * Enable durable queues (survive broker restarts)
   * @default false
   */
  durable?: boolean;
  /**
   * Maximum number of unacknowledged messages per consumer
   * @default 10
   */
  prefetchCount?: number;
  /**
   * Enable auto-acknowledgment of messages
   * @default false - requires manual ack for reliability
   */
  noAck?: boolean;
}

/**
 * Get RabbitMQ URL from environment with fallback
 */
export function getRabbitMQUrl(): string {
  return process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672";
}

/**
 * Creates optimized RabbitMQ consumer/microservice configuration
 * Use this for app.connectMicroservice() in main.ts
 *
 * @example
 * const options = createRabbitMQConsumer({
 *   queue: 'MyEventName',
 *   prefetchCount: 10,
 * });
 * app.connectMicroservice(options);
 */
export function createRabbitMQConsumer(
  config: RabbitMQConsumerConfig,
): RmqOptions {
  const { queue, durable = false, prefetchCount = 10, noAck = false } = config;

  return {
    transport: Transport.RMQ,
    options: {
      urls: [getRabbitMQUrl()],
      queue,
      noAck,
      prefetchCount,
      queueOptions: {
        durable,
        // Auto-delete queue when all consumers disconnect
        autoDelete: true,
        // Allow multiple consumers
        exclusive: false,
      },
      socketOptions: {
        // Detect dead connections
        heartbeatIntervalInSeconds: 60,
        // Auto-reconnect
        reconnectTimeInSeconds: 5,
      },
    },
  };
}

/**
 * Creates a client registration for ClientsModule.register()
 * Use this when a service needs to PUBLISH events (fire-and-forget)
 *
 * @example
 * ClientsModule.register([
 *   createRabbitMQPublisher('MY_EVENT', 'MyEventName'),
 * ])
 */
export function createRabbitMQPublisher(
  name: string,
  queue: string,
): {
  name: string;
  transport: Transport.RMQ;
  options: {
    urls: string[];
    queue: string;
    noAck: boolean;
    queueOptions: {
      durable: boolean;
      autoDelete: boolean;
    };
    socketOptions: {
      heartbeatIntervalInSeconds: number;
      reconnectTimeInSeconds: number;
    };
  };
} {
  return {
    name,
    transport: Transport.RMQ,
    options: {
      urls: [getRabbitMQUrl()],
      queue,
      // Fire-and-forget, no reply queues
      noAck: true,
      queueOptions: {
        durable: false,
        autoDelete: true,
      },
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
    },
  };
}
