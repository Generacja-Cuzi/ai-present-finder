import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "./user.entity";

export interface RecipientProfile {
  personal_info: {
    relationship?: string | null;
    occasion?: string | null;
    age_range?: string | null;
  };
  lifestyle: {
    primary_hobbies?: string[] | null;
    daily_routine?: string | null;
    relaxation_methods?: string[] | null;
    work_style?: string | null;
  };
  preferences: {
    home_aesthetic?: string | null;
    valued_items?: string[] | null;
    favorite_beverages?: string[] | null;
    comfort_foods?: string[] | null;
  };
  media_interests: {
    favorite_books?: string[] | null;
    must_watch_shows?: string[] | null;
    podcasts?: string[] | null;
    music_preferences?: string[] | null;
  };
  recent_life: {
    new_experiences?: string[] | null;
    mentioned_needs?: string[] | null;
    recent_achievements?: string[] | null;
  };
  gift_context: {
    occasion_significance?: string | null;
    gift_message?: string | null;
    previous_gift_successes?: string[] | null;
  };
}

@Entity("user_profiles")
@Index(["userId"])
export class UserProfile {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_id" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "person_name" })
  personName: string;

  @Column({ name: "chat_id" })
  chatId: string;

  @Column({ name: "profile", type: "jsonb" })
  profile: RecipientProfile;

  @Column({ name: "key_themes", type: "jsonb", default: [] })
  keyThemes: string[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
