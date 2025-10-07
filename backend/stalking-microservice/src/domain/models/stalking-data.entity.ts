import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("stalking_data")
export class StalkingData {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  productName: string;

  @Column({ type: "varchar", length: 500 })
  productUrl: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  currentPrice: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  targetPrice: number;

  @Column({ type: "varchar", length: 255 })
  platform: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
