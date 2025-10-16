export type XPostsResponse = XPosts[];

export interface XPosts {
  id: string;
  user_posted: string;
  name: string;
  description: string;
  date_posted: string;
  photos: string[];
  url: string;
  quoted_post: QuotedPost;
  tagged_users: TaggedUser[];
  replies: number;
  reposts: number;
  likes: number;
  views: number | null;
  external_url: string | null;
  hashtags: string[] | null;
  followers: number;
  biography: string;
  posts_count: number;
  profile_image_link: string;
  following: number;
  is_verified: boolean;
  quotes: number;
  bookmarks: number;
  parent_post_details: ParentPostDetails;
  external_image_urls: string[] | null;
  videos: unknown[] | null; // Replace 'any' with a specific video type if its structure is known
  external_video_urls: string[] | null;
  verification_type: string | null;
  user_id: string;
  context_added: unknown; // Replace 'any' with a specific type if known
}

export interface QuotedPost {
  data_posted: string | null;
  description: string | null;
  photos: string[] | null;
  post_id: string | null;
  profile_id: string | null;
  profile_name: string | null;
  url: string | null;
  videos: unknown[] | null; // Replace 'any' with a specific video type if its structure is known
}

export interface TaggedUser {
  biography: string | null;
  followers: number | null;
  following: number | null;
  is_verified: boolean | null;
  profile_id: string;
  profile_name: string;
  url: string;
}

export interface ParentPostDetails {
  post_id: string;
  profile_id: string;
  profile_name: string;
}
