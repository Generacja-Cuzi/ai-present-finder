import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Chat } from "./chat.entity";
import { Listing } from "./listing.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ name: "google_id", type: "varchar", unique: true, nullable: true })
  googleId: string | null;

  @Column({ type: "varchar", nullable: true })
  name: string | null;

  @Column({ name: "access_token", type: "text", nullable: true })
  accessToken: string | null;

  @Column({ name: "refresh_token", type: "text", nullable: true })
  refreshToken: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => Chat, (chat) => chat.user)
  chats: Chat[];

  @ManyToMany(() => Listing, (listing) => listing.favoritedBy)
  favoriteListings: Listing[];
}
