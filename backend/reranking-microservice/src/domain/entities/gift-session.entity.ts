import { RecipientProfile } from "@core/types";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

import { GiftSessionProduct } from "./gift-session-product.entity";

export enum SessionStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  TIMEOUT = "timeout",
}

@Entity("gift_sessions")
export class GiftSession {
  @PrimaryColumn({ name: "event_id", unique: true })
  eventId: string;

  @Column({ name: "chat_id" })
  chatId: string;

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

  @Column({
    name: "gift_context",
    type: "jsonb",
    nullable: true,
    array: false,
  })
  giftContext?: {
    userProfile: RecipientProfile | null;
    keywords: string[];
    saveProfile?: boolean;
    profileName?: string | null;
  } | null;

  @OneToMany(() => GiftSessionProduct, (product) => product.session)
  products?: GiftSessionProduct[];
}
