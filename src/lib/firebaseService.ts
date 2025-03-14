// src/lib/firebaseService.ts
import { firebaseApp, db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  increment,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  Firestore
} from 'firebase/firestore';
import { VideoData } from '@/types/video';

// Cache to store the last document for pagination
let lastVideoDoc: QueryDocumentSnapshot | null = null;

// Get videos for FYP feed with better error handling
export const getFYPVideos = async (count = 10): Promise<VideoData[]> => {
  try {
    console.log(`Fetching up to ${count} videos from Firebase...`);
    
    // Make sure Firebase is properly initialized
    if (!db) {
      console.error("Firestore database not initialized");
      return [];
    }
    
    let videosQuery;
    
    if (lastVideoDoc && count > 10) {
      // If we're fetching more videos and have a reference to the last document,
      // start after that document for pagination
      videosQuery = query(
        collection(db as Firestore, 'videos'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVideoDoc),
        limit(10)
      );
    } else {
      // For first fetch or explicit refresh
      videosQuery = query(
        collection(db as Firestore, 'videos'),
        orderBy('likes', 'desc'),
        limit(Math.min(count, 20)) // Safety limit
      );
    }
    
    // Log the query for debugging
    console.log("Firebase query executed");
    
    const snapshot = await getDocs(videosQuery);
    
    // Update the last document reference for pagination
    if (!snapshot.empty) {
      lastVideoDoc = snapshot.docs[snapshot.docs.length - 1];
    }
    
    console.log(`Received ${snapshot.docs.length} videos from Firebase`);
    
    // Transform Firestore data to VideoData objects with better error handling
    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Validate required fields and provide defaults for missing ones
      const video: VideoData = {
        id: doc.id,
        username: data.username || 'unknown',
        caption: data.caption || '',
        song: data.song || 'Original Sound',
        likes: data.likes || 0,
        comments: data.comments || 0,
        saves: data.saves || 0,
        shares: data.shares || 0,
        views: data.views || 0,
        videoUrl: data.videoUrl || '',
        userAvatar: data.userAvatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
        hashtags: data.hashtags || [],
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now()
      };
      
      // Log if we're missing critical data
      if (!video.videoUrl) {
        console.warn(`Video ${doc.id} is missing a videoUrl`);
      }
      
      return video;
    });
  } catch (error) {
    console.error('Error fetching FYP videos:', error);
    return [];
  }
};

// Reset pagination - call this when you want to start from the beginning
export const resetVideoFeed = () => {
  lastVideoDoc = null;
};

// Increase view count for a video with better error handling
export const increaseViewCount = async (videoId: string) => {
  try {
    if (!db || !videoId) {
      console.warn('Cannot increment view count: Invalid database or video ID');
      return;
    }
    
    const videoRef = doc(db as Firestore, 'videos', videoId);
    
    // Check if the document exists first
    const docSnap = await getDoc(videoRef);
    if (!docSnap.exists()) {
      console.warn(`Cannot increment view count: Video ${videoId} does not exist`);
      return;
    }
    
    await updateDoc(videoRef, {
      views: increment(1),
      lastViewed: Timestamp.now()
    });
    
    console.log(`Incremented view count for video ${videoId}`);
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};
