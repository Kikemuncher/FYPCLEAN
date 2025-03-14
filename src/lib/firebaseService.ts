// src/lib/firebaseService.ts
import { app } from './firebase';
import { VideoData } from '@/types/video';

// Get videos for FYP feed
export const getFYPVideos = async (count = 10): Promise<VideoData[]> => {
  try {
    const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
    const { getFirestore } = await import('./firebase');
    const db = await getFirestore();
    
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
    const { doc, updateDoc, increment } = await import('firebase/firestore');
    const { getFirestore } = await import('./firebase');
    const db = await getFirestore();
    
    const videoRef = doc(db, 'videos', videoId);
    await updateDoc(videoRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};
