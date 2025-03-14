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

// Cache for pagination
let lastVideoDoc: QueryDocumentSnapshot | null = null;

// Get videos for FYP feed - clean implementation
export const getFYPVideos = async (count = 10): Promise<VideoData[]> => {
  try {
    console.log(`Fetching up to ${count} videos from Firebase`);
    
    // Handle case when Firestore isn't initialized
    if (!db) {
      console.error("Firestore not initialized");
      return [];
    }
    
    let videosQuery;
    
    if (lastVideoDoc && count > 10) {
      // Pagination query (when fetching more)
      videosQuery = query(
        collection(db as Firestore, 'videos'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVideoDoc),
        limit(10)
      );
    } else {
      // Initial query
      videosQuery = query(
        collection(db as Firestore, 'videos'),
        orderBy('createdAt', 'desc'),
        limit(Math.min(count, 15))
      );
    }
    
    console.log("Executing Firebase query");
    const snapshot = await getDocs(videosQuery);
    
    // Update pagination reference
    if (!snapshot.empty) {
      lastVideoDoc = snapshot.docs[snapshot.docs.length - 1];
    }
    
    console.log(`Retrieved ${snapshot.docs.length} videos from Firebase`);
    
    // Convert to VideoData objects
    const videos = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert to VideoData with defaults for missing fields
      const video: VideoData = {
        id: doc.id,
        username: data.username || 'firebase_user',
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
      
      return video;
    });
    
    return videos;
  } catch (error) {
    console.error('Error fetching videos from Firebase:', error);
    return [];
  }
};

// Reset pagination
export const resetVideoFeed = () => {
  lastVideoDoc = null;
};

// Track video view
export const increaseViewCount = async (videoId: string) => {
  try {
    if (!db || !videoId) {
      console.warn('Cannot track view: Invalid database or video ID');
      return;
    }
    
    const videoRef = doc(db as Firestore, 'videos', videoId);
    
    // Verify document exists
    const docSnap = await getDoc(videoRef);
    if (!docSnap.exists()) {
      console.warn(`Video document ${videoId} not found`);
      return;
    }
    
    // Update view count
    await updateDoc(videoRef, {
      views: increment(1),
      lastViewed: Timestamp.now()
    });
    
    console.log(`View tracked for video ${videoId}`);
  } catch (error) {
    console.error('Error tracking view:', error);
  }
};
