export interface VideoData {
  id: string;
  userId: string;          // Owner's user ID
  username: string;        // Owner's username
  caption: string;
  song?: string;
  likes: number | string[];  // Can be count or array of user IDs
  comments: number;
  saves?: number;
  shares?: number;
  views: number;
  videoUrl: string;
  thumbnailUrl?: string;
  userAvatar?: string;
  hashtags?: string[];
  createdAt?: number;      // Timestamp
  creatorUid?: string;
  status: 'processing' | 'active' | 'failed' | 'private' | 'deleted';
  isPrivate?: boolean;
  width?: number;
  height?: number;
}

export interface VideoUploadResult {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  success: boolean;
  error?: string;
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
