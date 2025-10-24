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
    // Check if user connection exists first
    if (!this.allSubscribedUsers.has(notification.userId)) {
      this.logger.warn(
        `User ${notification.userId} is not connected, skipping message send`,
      );
      return;
    }

    try {
      await pRetry(
        () => {
          const connection = this.allSubscribedUsers.get(notification.userId);
          if (connection == null) {
            throw new Error("this should not happen");
          }
          this.logger.log(`Sending message ${JSON.stringify(notification)}`);
          connection.eventSubject.next(
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
              `Attempt ${error.attemptNumber.toString()} failed. There are ${error.retriesLeft.toString()} retries left.`,
            );
          },
        },
      );
      this.logger.log(
        `Successfully sent message to user ${notification.userId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send message to active connection for user ${notification.userId} after 2 retries: ${errorMessage}`,
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
    this.logger.log(`adding user ${id}`);
    if (this.allSubscribedUsers.has(id)) {
      const existing = this.allSubscribedUsers.get(id);
      if (existing == null) {
        throw new Error("this should not happen");
      }
      this.allSubscribedUsers.set(id, {
        ...existing,
        count: existing.count + 1,
      });
    } else {
      this.allSubscribedUsers.set(id, {
        count: 1,
        eventSubject: new Subject<MessageEvent<SseMessageDto>>(),
      });
    }
  }

  removeUser(id: string): void {
    if (this.allSubscribedUsers.has(id)) {
      const existing = this.allSubscribedUsers.get(id);
      if (existing == null) {
        throw new Error("this should not happen");
      }
      if (existing.count === 1) {
        this.allSubscribedUsers.delete(id);
      } else {
        this.allSubscribedUsers.set(id, {
          ...existing,
          count: existing.count - 1,
        });
      }
    }
  }
}
