import { Column, Entity, PrimaryColumn } from "typeorm";

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
