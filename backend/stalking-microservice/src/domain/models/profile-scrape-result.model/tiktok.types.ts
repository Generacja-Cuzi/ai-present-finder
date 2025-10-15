export type TikTokProfileResponse = TikTokProfile[];

export interface TikTokProfile {
  account_id: string;
  nickname: string;
  biography: string;
  awg_engagement_rate: number;
  comment_engagement_rate: number;
  like_engagement_rate: number;
  bio_link: string;
  predicted_lang: string;
  is_verified: boolean;
  followers: number;
  following: number;
  likes: number;
  videos_count: number;
  create_time: string;
  id: string;
  url: string;
  profile_pic_url: string;
  like_count: number;
  digg_count: number;
  is_private: boolean;
  profile_pic_url_hd: string;
  secu_id: string;
  short_id: null;
  ftc: null;
  relation: null;
  open_favorite: boolean;
  comment_setting: null;
  duet_setting: null;
  stitch_setting: null;
  is_ad_virtual: boolean;
  room_id: null;
  is_under_age_18: null;
  top_videos: TopVideo[];
  signature: string;
  discovery_input: Record<string, never>; // Or Record<string, never> for an empty object
  is_commerce_user: boolean;
  top_posts_data: TopPost[];
}

export interface TopVideo {
  commentcount: number;
  cover_image: string;
  create_date: string;
  diggcount: number;
  favorites_count: number;
  playcount: number;
  share_count: number;
  video_id: string;
  video_url: string;
}

export interface TopPost {
  create_time: string;
  description: string;
  hashtags: (string | null)[] | null;
  likes: number;
  post_id: string;
  post_type: PostType;
  post_url: string;
}

export enum PostType {
  Photo = "photo",
  Video = "video",
}
