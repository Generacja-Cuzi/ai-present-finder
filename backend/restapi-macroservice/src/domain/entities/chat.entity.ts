import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Listing } from "./listing.entity";
import { Message } from "./message.entity";
import { User } from "./user.entity";

@Entity("chats")
@Index(["userId"])
export class Chat {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "chat_id", unique: true })
  chatId: string;

  @Column({ name: "chat_name" })
  chatName: string;

  @Column({ name: "user_id" })
  userId: string;

  @ManyToOne(() => User, (user) => user.chats, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Listing, (listing) => listing.chat)
  listings: Listing[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @Column({ name: "is_interview_completed", default: false })
  isInterviewCompleted: boolean;
}
