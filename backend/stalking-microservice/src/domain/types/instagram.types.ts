export type InstagramProfileResponse = InstagramAccount[];

export interface InstagramAccount {
  account: string;
  fbid: string;
  id: string;
  followers: number;
  posts_count: number;
  is_business_account: boolean;
  is_professional_account: boolean;
  is_verified: boolean;
  avg_engagement: number;
  external_url: string[];
  biography: string;
  business_category_name: string;
  category_name: null | string;
  post_hashtags: null | string[];
  following: number;
  posts: Post[];
  profile_image_link: string;
  profile_url: string;
  profile_name: string;
  highlights_count: number;
  highlights: null | unknown[]; // Replace 'any' with a specific type if the structure of highlights is known
  full_name: string;
  is_private: boolean;
  bio_hashtags: null | string[];
  url: string;
  is_joined_recently: boolean;
  has_channel: boolean;
  partner_id: string;
  business_address: null | string;
  related_accounts: RelatedAccount[];
  email_address: null | string;
}

export interface Post {
  caption: string;
  comments?: number;
  content_type: ContentType;
  datetime: string;
  id: string;
  image_url: string;
  is_pinned: boolean;
  likes?: number;
  url: string;
  video_url: null | string;
}

export enum ContentType {
  Carousel = "Carousel",
  Image = "Image",
  Video = "Video",
}

export interface RelatedAccount {
  id: string;
  is_private: boolean;
  is_verified: boolean;
  profile_name: string;
  profile_pic_url: string;
  user_name: string;
}
