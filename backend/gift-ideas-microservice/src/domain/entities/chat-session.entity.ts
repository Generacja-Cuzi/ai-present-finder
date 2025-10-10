import { RecipientProfile } from "@core/types";
import { Column, Entity, PrimaryColumn } from "typeorm";

export enum SessionStatus {
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
}

@Entity("chat_sessions")
export class ChatSession {
  @PrimaryColumn({ name: "chat_id", unique: true })
  chatId: string;

  @Column({
    name: "stalking_status",
    type: "enum",
    enum: SessionStatus,
    default: SessionStatus.IN_PROGRESS,
  })
  stalkingStatus: SessionStatus;

  @Column({
    name: "interview_status",
    type: "enum",
    enum: SessionStatus,
    default: SessionStatus.IN_PROGRESS,
  })
  interviewStatus: SessionStatus;

  @Column({
    name: "stalking_keywords",
    type: "jsonb",
    nullable: true,
  })
  stalkingKeywords?: string[] | null;

  @Column({
    name: "interview_profile",
    type: "jsonb",
    nullable: true,
  })
  interviewProfile?: RecipientProfile | null;

  @Column({
    name: "gift_generation_triggered",
    type: "boolean",
    default: false,
  })
  giftGenerationTriggered: boolean;

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
