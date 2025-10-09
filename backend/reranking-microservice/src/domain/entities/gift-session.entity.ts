import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum SessionStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  TIMEOUT = "timeout",
}

@Entity("gift_sessions")
export class GiftSession {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "session_id", unique: true })
  sessionId: string;

  @Column({ name: "chat_id" })
  chatId: string;

  @Column({ name: "event_id" })
  eventId: string;

  @Column({
    name: "status",
    type: "enum",
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @Column({ name: "completed_events", default: 0 })
  completedEvents: number;

  @Column({ name: "total_events" })
  totalEvents: number;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
