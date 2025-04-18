// src/types/user.ts
export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
  isVerified: boolean;
  isCreator: boolean;
  isAdmin: boolean;
  accountType: 'user' | 'creator';
}

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email?: string; // Make email optional for flexibility
  bio: string;
  photoURL: string;
  coverPhotoURL: string;
  followerCount: number;
  followingCount: number;
  videoCount: number;
  likeCount: number;
  links: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  };
  createdAt: number;
  updatedAt?: number;
  isVerified: boolean;
  isCreator: boolean;
  accountType: 'user' | 'creator' | 'admin';
  creatorBio?: string;
  creatorCategory?: string;
  portfolioLinks?: string[];
  followers?: string[];
  following?: string[];
  likedVideos?: string[];
}

export interface CreatorApplication {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  reason: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  rejectionReason?: string;
}
