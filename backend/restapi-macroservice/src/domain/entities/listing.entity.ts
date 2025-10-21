import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Chat } from "./chat.entity";
import { User } from "./user.entity";

@Entity("listings")
@Index(["chatId"])
export class Listing {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "chat_id", nullable: true })
  chatId: string | null;

  @ManyToOne(() => Chat, (chat) => chat.listings, { onDelete: "SET NULL" })
  @JoinColumn({ name: "chat_id", referencedColumnName: "chatId" })
  chat: Chat | null;

  @ManyToMany(() => User, (user) => user.favoriteListings)
  @JoinTable({
    name: "user_favorite_listings",
    joinColumn: { name: "listing_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "user_id", referencedColumnName: "id" },
  })
  favoritedBy: User[];

  @Column({ type: "varchar", nullable: true })
  image: string | null;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "varchar" })
  link: string;

  @Column({
    name: "price_value",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  priceValue: number | null;

  @Column({ name: "price_label", type: "varchar", nullable: true })
  priceLabel: string | null;

  @Column({ name: "price_currency", type: "varchar", nullable: true })
  priceCurrency: string | null;

  @Column({ name: "price_negotiable", type: "boolean", default: false })
  priceNegotiable: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
