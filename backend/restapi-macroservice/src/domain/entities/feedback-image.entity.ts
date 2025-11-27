import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Feedback } from "./feedback.entity";

@Entity("feedback_images")
export class FeedbackImage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "feedback_id" })
  feedbackId: string;

  @ManyToOne(() => Feedback, { onDelete: "CASCADE" })
  @JoinColumn({ name: "feedback_id" })
  feedback: Feedback;

  @Column({ name: "image_data", type: "bytea" })
  imageData: Buffer;

  @Column({ name: "mime_type", type: "varchar", length: 100 })
  mimeType: string;

  @Column({ name: "file_size", type: "int" })
  fileSize: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
