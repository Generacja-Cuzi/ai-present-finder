import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

type EventObject = {
  count: number;
  eventSubject: Subject<MessageEvent>;
};

@Injectable()
export class SseService {
  private readonly allSubscribedUsers: Map<string, EventObject> = new Map();

  sendEvent(notification: { userId: string; message: string }) {
    if (this.allSubscribedUsers.has(notification.userId)) {
      const connection = this.allSubscribedUsers.get(notification.userId);
      if (!connection) {
        throw new Error('this should not happen');
      }
      connection.eventSubject.next({
        data: notification.message,
      } as MessageEvent);
    }
  }

  events(id: string) {
    const connection = this.allSubscribedUsers.get(id);
    if (!connection) {
      throw new Error('this should not happen');
    }
    return connection.eventSubject.asObservable();
  }

  addUser(id: string): void {
    if (this.allSubscribedUsers.has(id)) {
      const existing = this.allSubscribedUsers.get(id);
      if (!existing) {
        throw new Error('this should not happen');
      }
      this.allSubscribedUsers.set(id, {
        ...existing,
        count: existing.count + 1,
      });
    } else {
      this.allSubscribedUsers.set(id, {
        count: 1,
        eventSubject: new Subject<MessageEvent>(),
      });
    }
  }

  removeUser(id: string): void {
    if (this.allSubscribedUsers.has(id)) {
      const existing = this.allSubscribedUsers.get(id);
      if (!existing) {
        throw new Error('this should not happen');
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
