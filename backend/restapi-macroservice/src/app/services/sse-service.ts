import { Subject } from "rxjs";
import {
  SseMessageDto,
  uiUpdateEvent,
} from "src/domain/models/sse-message.dto";

import { Injectable, Logger } from "@nestjs/common";

type EventObject = {
  count: number;
  eventSubject: Subject<MessageEvent<SseMessageDto>>;
};

@Injectable()
export class SseService {
  private readonly allSubscribedUsers: Map<string, EventObject> = new Map();
  private readonly logger = new Logger(SseService.name);
  sendEvent(notification: { userId: string; message: SseMessageDto }) {
    if (this.allSubscribedUsers.has(notification.userId)) {
      const connection = this.allSubscribedUsers.get(notification.userId);
      if (!connection) {
        throw new Error("this should not happen");
      }
      this.logger.log("Sending message " + JSON.stringify(notification));
      connection.eventSubject.next(
        new MessageEvent(uiUpdateEvent, {
          data: notification.message,
        }),
      );
    } else {
      this.logger.warn("User not found: " + notification.userId);
    }
  }

  events(id: string) {
    const connection = this.allSubscribedUsers.get(id);
    if (!connection) {
      throw new Error("this should not happen");
    }
    return connection.eventSubject.asObservable();
  }

  addUser(id: string): void {
    this.logger.log("adding user " + id);
    if (this.allSubscribedUsers.has(id)) {
      const existing = this.allSubscribedUsers.get(id);
      if (!existing) {
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
      if (!existing) {
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
