import type { RecipientProfile } from "@core/types";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "./user.entity";

@Entity("user_profiles")
@Index(["userId"])
export class UserProfile {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_id" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "person_name" })
  personName: string;

  @Column({ name: "chat_id" })
  chatId: string;

  @Column({ name: "profile", type: "jsonb" })
  profile: RecipientProfile;

  @Column({ name: "key_themes", type: "jsonb", default: [] })
  keyThemes: string[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
