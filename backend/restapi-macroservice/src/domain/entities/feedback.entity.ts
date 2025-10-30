import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Chat } from "./chat.entity";
import { User } from "./user.entity";

@Entity("feedbacks")
@Index(["chatId"], { unique: true })
export class Feedback {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "chat_id", unique: true })
  chatId: string;

  @OneToOne(() => Chat, { onDelete: "CASCADE" })
  @JoinColumn({ name: "chat_id" })
  chat: Chat;

  @Column({ name: "user_id" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "int" })
  rating: number;

  @Column({ type: "text", nullable: true })
  comment: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
