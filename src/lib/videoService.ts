// First, remove the comment lines that were added during debugging
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { VideoData } from '@/types/video';
import { UserProfile } from '@/types/user';

// Get user by ID - placeholder until you implement this function in userService.ts
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }
    
    return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
};

// Upload a video to Firebase Storage
export const uploadVideo = async (
  userId: string,
  file: File,
  progressCallback?: (progress: number) => void
): Promise<string> => {
  // Existing implementation
  // ...
};

// Create a new video document in Firestore
export const createVideoDocument = async (
  userId: string,
  videoUrl: string,
  data: {
    caption: string;
    song?: string;
    hashtags?: string[];
  }
): Promise<string> => {
  // Existing implementation
  // ...
};

// Get feed videos
export const getFeedVideos = async (
  lastVisibleDoc?: QueryDocumentSnapshot<DocumentData>,
  pageSize: number = 10
): Promise<{videos: VideoData[], lastVisible: QueryDocumentSnapshot<DocumentData> | null}> => {
  // Existing implementation
  // ...
};

// Get video by ID
export const getVideoById = async (videoId: string): Promise<VideoData | null> => {
  // Existing implementation
  // ...
};

// Get videos by user
export const getVideosByUsername = async (username: string): Promise<VideoData[]> => {
  // Existing implementation
  // ...
};

// Increment view count
export const incrementVideoView = async (videoId: string): Promise<boolean> => {
  // Existing implementation
  // ...
};

// Like a video
export const likeVideo = async (userId: string, videoId: string): Promise<boolean> => {
  // Existing implementation
  // ...
};

// Unlike a video
export const unlikeVideo = async (userId: string, videoId: string): Promise<boolean> => {
  // Existing implementation
  // ...
};

// Check if user has liked a video
export const isVideoLikedByUser = async (userId: string, videoId: string): Promise<boolean> => {
  // Existing implementation
  // ...
};

// Delete a video
export const deleteVideo = async (videoId: string, userId: string): Promise<boolean> => {
  // Existing implementation
  // ...
};

// Add a comment to a video
export const addComment = async (
  userId: string,
  videoId: string,
  comment: string
): Promise<string | null> => {
  // Existing implementation
  // ...
};

// Get comments for a video
export const getVideoComments = async (videoId: string): Promise<any[]> => {
  // Existing implementation
  // ...
};

// Share video
export const incrementShareCount = async (videoId: string): Promise<boolean> => {
  // Existing implementation
  // ...
};

// Add this explicit export to ensure all functions are accessible
export {
  getUserById,
  uploadVideo,
  createVideoDocument,
  getFeedVideos,
  getVideoById,
  getVideosByUsername,
  incrementVideoView,
  likeVideo,
  unlikeVideo,
  isVideoLikedByUser,
  deleteVideo,
  addComment,
  getVideoComments,
  incrementShareCount
};
