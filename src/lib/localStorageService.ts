// src/lib/localStorageService.ts

// Types
import { User, UserProfile } from '@/types/user';
import { VideoData } from '@/types/video';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'local_users',
  USER_PROFILES: 'local_user_profiles',
  VIDEOS: 'local_videos',
  FOLLOWS: 'local_follows',
  LIKES: 'local_likes',
  COMMENTS: 'local_comments',
  CURRENT_USER: 'local_current_user'
};

// Safe storage operations
const safelyGetItem = (key: string, defaultValue: any = null) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const safelySetItem = (key: string, value: any): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
};

// User functions
export const getUsers = (): User[] => {
  return safelyGetItem(STORAGE_KEYS.USERS, []);
};

export const getUserProfiles = (): UserProfile[] => {
  return safelyGetItem(STORAGE_KEYS.USER_PROFILES, []);
};

export const saveUser = (user: User): boolean => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.uid === user.uid);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  return safelySetItem(STORAGE_KEYS.USERS, users);
};

export const saveUserProfile = (profile: UserProfile): boolean => {
  const profiles = getUserProfiles();
  const existingIndex = profiles.findIndex(p => p.uid === profile.uid);
  
  if (existingIndex >= 0) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }
  
  return safelySetItem(STORAGE_KEYS.USER_PROFILES, profiles);
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
};

export const getUserById = (uid: string): User | null => {
  const users = getUsers();
  return users.find(user => user.uid === uid) || null;
};

export const getUserProfileById = (uid: string): UserProfile | null => {
  const profiles = getUserProfiles();
  return profiles.find(profile => profile.uid === uid) || null;
};

export const getUserProfileByUsername = (username: string): UserProfile | null => {
  const profiles = getUserProfiles();
  return profiles.find(profile => profile.username === username) || null;
};

export const setCurrentUser = (uid: string | null): boolean => {
  return safelySetItem(STORAGE_KEYS.CURRENT_USER, uid);
};

export const getCurrentUserId = (): string | null => {
  return safelyGetItem(STORAGE_KEYS.CURRENT_USER, null);
};

// Video functions
export const getVideos = (): VideoData[] => {
  return safelyGetItem(STORAGE_KEYS.VIDEOS, []);
};

export const saveVideo = (video: VideoData): boolean => {
  const videos = getVideos();
  const existingIndex = videos.findIndex(v => v.id === video.id);
  
  if (existingIndex >= 0) {
    videos[existingIndex] = video;
  } else {
    videos.push(video);
  }
  
  return safelySetItem(STORAGE_KEYS.VIDEOS, videos);
};

export const getVideosByUser = (uid: string): VideoData[] => {
  const videos = getVideos();
  return videos.filter(video => video.creatorUid === uid);
};

// Follow/Like system
interface FollowRelation {
  followerId: string; // user who is following
  followingId: string; // user being followed
  timestamp: number;
}

interface LikeRelation {
  userId: string;
  videoId: string;
  timestamp: number;
}

export const getFollows = (): FollowRelation[] => {
  return safelyGetItem(STORAGE_KEYS.FOLLOWS, []);
};

export const getLikes = (): LikeRelation[] => {
  return safelyGetItem(STORAGE_KEYS.LIKES, []);
};

export const followUser = (followerId: string, followingId: string): boolean => {
  const follows = getFollows();
  
  // Check if already following
  const alreadyFollowing = follows.some(
    f => f.followerId === followerId && f.followingId === followingId
  );
  
  if (alreadyFollowing) return true;
  
  follows.push({
    followerId,
    followingId,
    timestamp: Date.now()
  });
  
  return safelySetItem(STORAGE_KEYS.FOLLOWS, follows);
};

export const unfollowUser = (followerId: string, followingId: string): boolean => {
  const follows = getFollows();
  const filteredFollows = follows.filter(
    f => !(f.followerId === followerId && f.followingId === followingId)
  );
  
  return safelySetItem(STORAGE_KEYS.FOLLOWS, filteredFollows);
};

export const likeVideo = (userId: string, videoId: string): boolean => {
  const likes = getLikes();
  
  // Check if already liked
  const alreadyLiked = likes.some(
    l => l.userId === userId && l.videoId === videoId
  );
  
  if (alreadyLiked) return true;
  
  likes.push({
    userId,
    videoId,
    timestamp: Date.now()
  });
  
  return safelySetItem(STORAGE_KEYS.LIKES, likes);
};

export const unlikeVideo = (userId: string, videoId: string): boolean => {
  const likes = getLikes();
  const filteredLikes = likes.filter(
    l => !(l.userId === userId && l.videoId === videoId)
  );
  
  return safelySetItem(STORAGE_KEYS.LIKES, filteredLikes);
};

export const isFollowing = (followerId: string, followingId: string): boolean => {
  const follows = getFollows();
  return follows.some(
    f => f.followerId === followerId && f.followingId === followingId
  );
};

export const isVideoLiked = (userId: string, videoId: string): boolean => {
  const likes = getLikes();
  return likes.some(
    l => l.userId === userId && l.videoId === videoId
  );
};

export const getFollowerCount = (userId: string): number => {
  const follows = getFollows();
  return follows.filter(f => f.followingId === userId).length;
};

export const getFollowingCount = (userId: string): number => {
  const follows = getFollows();
  return follows.filter(f => f.followerId === userId).length;
};

export const getLikeCount = (videoId: string): number => {
  const likes = getLikes();
  return likes.filter(l => l.videoId === videoId).length;
};

// Helper to wipe all data (for testing)
export const clearAllData = (): void => {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
