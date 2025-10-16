import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

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

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date;
}
