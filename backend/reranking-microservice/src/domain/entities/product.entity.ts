import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from "typeorm";

import { GiftSessionProduct } from "./gift-session-product.entity";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "image", type: "text", nullable: true })
  image: string | null;

  @Column({ name: "title", type: "text" })
  title: string;

  @Column({ name: "description", type: "text" })
  description: string;

  @Column({ name: "link", type: "text" })
  link: string;

  @Column({ name: "price_value", type: "double precision", nullable: true })
  priceValue: number | null;

  @Column({ name: "price_label", type: "text", nullable: true })
  priceLabel: string | null;

  @Column({
    name: "price_currency",
    type: "varchar",
    length: 8,
    nullable: true,
  })
  priceCurrency: string | null;

  @Column({ name: "price_negotiable", type: "boolean", nullable: true })
  priceNegotiable: boolean | null;

  @Column({ name: "rating", type: "integer", nullable: true })
  rating: number | null;

  @Column({ name: "reasoning", type: "text", nullable: true })
  reasoning: string | null;

  @ManyToOne(
    () => GiftSessionProduct,
    (giftSessionProduct) => giftSessionProduct.products,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "gift_session_product_id" })
  giftSessionProduct: GiftSessionProduct;

  @RelationId((product: Product) => product.giftSessionProduct)
  giftSessionProductId: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date;
}
