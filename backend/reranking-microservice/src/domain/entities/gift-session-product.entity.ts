import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";

import { GiftSession } from "./gift-session.entity";
import { Product } from "./product.entity";

@Entity("gift_session_products")
export class GiftSessionProduct {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => GiftSession, (session) => session.products, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "session_event_id", referencedColumnName: "eventId" })
  session: GiftSession;

  @RelationId((product: GiftSessionProduct) => product.session)
  sessionEventId: string;

  @Column({ name: "source_event_name", length: 128 })
  sourceEventName: string;

  @Column({ name: "source_event_provider", length: 32 })
  sourceEventProvider: string;

  @Column({ name: "source_event_success" })
  sourceEventSuccess: boolean;

  @OneToMany(() => Product, (product) => product.giftSessionProduct, {
    cascade: ["insert", "remove"],
    eager: true,
  })
  products: Product[];

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;
}
