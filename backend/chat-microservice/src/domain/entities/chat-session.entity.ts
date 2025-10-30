import { Column, Entity, PrimaryColumn } from "typeorm";

export type ChatSessionPhase =
  | "interview"
  | "ask_save_profile"
  | "ask_profile_name"
  | "completed";

@Entity("chat_sessions")
export class ChatSession {
  @PrimaryColumn({ name: "chat_id", unique: true })
  chatId: string;

  @Column({
    name: "occasion",
    type: "varchar",
    nullable: true,
  })
  occasion?: string | null;

  @Column({
    name: "phase",
    type: "varchar",
    default: "interview",
  })
  phase: ChatSessionPhase;

  @Column({
    name: "pending_profile_data",
    type: "jsonb",
    nullable: true,
  })
  pendingProfileData?: Record<string, unknown>;

  @Column({
    name: "save_profile_choice",
    type: "boolean",
    nullable: true,
  })
  saveProfileChoice?: boolean | null;

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
