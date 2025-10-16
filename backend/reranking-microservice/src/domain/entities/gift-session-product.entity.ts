import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @ManyToOne(() => Product, {
    cascade: ["insert", "remove"],
    eager: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @RelationId(
    (giftSessionProduct: GiftSessionProduct) => giftSessionProduct.product,
  )
  productId: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;
}
