import pRetry from "p-retry";
import { Subject } from "rxjs";
import { uiUpdateEvent } from "src/domain/models/sse-message.dto";
import type { SseMessageDto } from "src/domain/models/sse-message.dto";

import { Injectable, Logger } from "@nestjs/common";

interface EventObject {
  count: number;
  eventSubject: Subject<MessageEvent<SseMessageDto>>;
}

@Injectable()
export class SseService {
  private readonly allSubscribedUsers = new Map<string, EventObject>();
  private readonly logger = new Logger(SseService.name);
  async sendEvent(notification: { userId: string; message: SseMessageDto }) {
    // Debug: Log all active connections
    const activeConnections = [...this.allSubscribedUsers.keys()];
    this.logger.debug(
      `Attempting to send to userId: ${notification.userId}. Active connections: [${activeConnections.join(", ")}]`,
    );

    try {
      await pRetry(
        () => {
          // Re-check connection in case it was removed during retry
          const currentConnection = this.allSubscribedUsers.get(
            notification.userId,
          );
          if (currentConnection == null) {
            throw new Error("Connection was removed during send attempt");
          }
          this.logger.log(`Sending message ${JSON.stringify(notification)}`);
          currentConnection.eventSubject.next(
            new MessageEvent(uiUpdateEvent, {
              data: notification.message,
            }),
          );
        },
        {
          retries: 3,
          minTimeout: 100,
          factor: 2,
          onFailedAttempt: (error) => {
            this.logger.warn(
              `Attempt ${error.attemptNumber.toString()} failed. There are ${error.retriesLeft.toString()} retries left. Update type: ${notification.message.type}`,
            );
          },
        },
      );
      this.logger.log(
        `Successfully sent message to user ${notification.userId}. Update type: ${notification.message.type}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send message to active connection for user ${notification.userId} after retries: ${errorMessage}. Update type: ${notification.message.type}`,
      );
    }
  }

  events(id: string) {
    const connection = this.allSubscribedUsers.get(id);
    if (connection == null) {
      throw new Error("this should not happen");
    }
    return connection.eventSubject.asObservable();
  }

  addUser(id: string): void {
    this.logger.log(`Adding SSE user connection: ${id}`);
    if (this.allSubscribedUsers.has(id)) {
      const existing = this.allSubscribedUsers.get(id);
      if (existing == null) {
        throw new Error("this should not happen when adding user");
      }
      this.allSubscribedUsers.set(id, {
        ...existing,
        count: existing.count + 1,
      });
      this.logger.log(
        `Incremented connection count for ${id}. New count: ${String(existing.count + 1)}`,
      );
    } else {
      this.allSubscribedUsers.set(id, {
        count: 1,
        eventSubject: new Subject<MessageEvent<SseMessageDto>>(),
      });
      this.logger.log(
        `Created new SSE connection for ${id}. Total active connections: ${String(this.allSubscribedUsers.size)}`,
      );
    }
  }

  removeUser(id: string): void {
    this.logger.log(`Removing SSE user connection: ${id}`);
    if (this.allSubscribedUsers.has(id)) {
      const existing = this.allSubscribedUsers.get(id);
      if (existing == null) {
        throw new Error("this should not happen when removing user");
      }
      if (existing.count === 1) {
        this.allSubscribedUsers.delete(id);
        this.logger.log(
          `Deleted SSE connection for ${id}. Remaining active connections: ${String(this.allSubscribedUsers.size)}`,
        );
      } else {
        this.allSubscribedUsers.set(id, {
          ...existing,
          count: existing.count - 1,
        });
        this.logger.log(
          `Decremented connection count for ${id}. New count: ${String(existing.count - 1)}`,
        );
      }
    } else {
      this.logger.warn(
        `Attempted to remove SSE connection for ${id}, but it was not found`,
      );
    }
  }
}
