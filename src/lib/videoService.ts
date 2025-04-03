// src/lib/videoService.ts

import { db, storage } from './firebase';
import { collection, getDocs, query, orderBy, limit, doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore'; // Added increment import
import { VideoData } from '@/types/video';

// Update to fetch only from Firebase
export const getFeedVideos = async (): Promise<VideoData[]> => {
  try {
    // Get videos only from Firebase
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No videos found in Firebase');
      return [];
    }
    
    // Map Firebase documents to VideoData
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        username: data.username || '',
        caption: data.caption || '',
        song: data.song || 'Original Sound',
        likes: data.likes || 0,
        comments: data.comments || 0,
        saves: data.saves || 0,
        shares: data.shares || 0,
        views: data.views || 0,
        videoUrl: data.url || '',
        userAvatar: data.userAvatar || data.profilePic || '',
        creatorUid: data.creatorUid || data.uid || '',
        createdAt: data.createdAt?.toMillis() || Date.now()
      };
    });
  } catch (error) {
    console.error('Error fetching videos from Firebase:', error);
    return [];
  }
};

// Increment view count
export const incrementVideoView = async (videoId: string): Promise<boolean> => {
  try {
    const videoDocRef = doc(db, 'videos', videoId);
    await updateDoc(videoDocRef, {
      views: increment(1) // Changed to use the imported increment function
    });
    return true;
  } catch (error) {
    console.error('Error incrementing video view:', error);
    return false;
  }
};

// Like video
export const likeVideo = async (userId: string, videoId: string): Promise<boolean> => {
  try {
    const videoDocRef = doc(db, 'videos', videoId);
    await updateDoc(videoDocRef, {
      likes: increment(1), // Changed to increment function
      likedBy: arrayUnion(userId)
    });
    return true;
  } catch (error) {
    console.error('Error liking video:', error);
    return false;
  }
};

// Unlike video
export const unlikeVideo = async (userId: string, videoId: string): Promise<boolean> => {
  try {
    const videoDocRef = doc(db, 'videos', videoId);
    await updateDoc(videoDocRef, {
      likes: increment(-1), // Changed to increment function
      likedBy: arrayRemove(userId)
    });
    return true;
  } catch (error) {
    console.error('Error unliking video:', error);
    return false;
  }
};
