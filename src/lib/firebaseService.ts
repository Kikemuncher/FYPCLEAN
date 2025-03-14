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
  increment 
} from 'firebase/firestore';
import { VideoData } from '@/types/video';

// Get videos for FYP feed
export const getFYPVideos = async (count = 10): Promise<VideoData[]> => {
  try {
    const videosQuery = query(
      collection(db, 'videos'),
      orderBy('likes', 'desc'),
      limit(count)
    );
    
    const snapshot = await getDocs(videosQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoData));
  } catch (error) {
    console.error('Error fetching FYP videos:', error);
    return [];
  }
};

// Increase view count for a video
export const increaseViewCount = async (videoId: string) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    await updateDoc(videoRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};
