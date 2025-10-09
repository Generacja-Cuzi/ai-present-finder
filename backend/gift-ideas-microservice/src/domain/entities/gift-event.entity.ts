import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum EventStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  TIMEOUT = "timeout",
}

export enum ServiceType {
  ALLEGRO = "allegro",
  AMAZON = "amazon",
  EBAY = "ebay",
  OLX = "olx",
}

@Entity("gift_events")
export class GiftEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "session_id", type: "uuid" })
  sessionId: string;

  @Column({ name: "service_type", type: "enum", enum: ServiceType })
  serviceType: ServiceType;

  @Column({ name: "event_uuid", type: "uuid", unique: true })
  eventUuid: string;

  @Column({
    name: "status",
    type: "enum",
    enum: EventStatus,
    default: EventStatus.PENDING,
  })
  status: EventStatus;

  @Column({ name: "sent_at", type: "timestamp" })
  sentAt: Date;

  @Column({ name: "received_at", type: "timestamp", nullable: true })
  receivedAt?: Date;

  @Column({ name: "timeout_at", type: "timestamp" })
  timeoutAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
