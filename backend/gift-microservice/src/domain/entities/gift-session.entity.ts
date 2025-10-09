import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

export enum SessionStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  TIMEOUT = "TIMEOUT",
}

@Entity("gift_sessions")
export class GiftSession {
  @PrimaryColumn("uuid")
  sessionId: string;

  @Column()
  chatId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: "enum",
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @Column({ type: "int", default: 0 })
  completedEvents: number;

  @Column({ type: "int", default: 0 })
  totalEvents: number;
}
