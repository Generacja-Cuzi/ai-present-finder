import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("chat_messages")
export class ChatMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  message: string;

  @Column({ type: "varchar", length: 255 })
  sender: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  sessionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
