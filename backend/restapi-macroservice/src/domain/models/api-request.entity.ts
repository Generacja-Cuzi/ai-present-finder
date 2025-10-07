import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("api_requests")
export class ApiRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  endpoint: string;

  @Column({ type: "varchar", length: 10 })
  method: string;

  @Column({ type: "timestamp", nullable: true })
  requestData: Date;

  @Column({ type: "timestamp", nullable: true })
  responseData: Date;

  @Column({ type: "int" })
  statusCode: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
