export interface VideoData {
  id: string;
  username: string;
  caption: string;
  song: string;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  views: number;
  videoUrl: string;
  userAvatar: string;
  hashtags?: string[];
  createdAt?: number; // Timestamp
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  comment: string;
  createdAt: number;
  likes: number;
}
