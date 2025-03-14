// src/lib/firebaseService.ts
import { firebaseApp, db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc,
  updateDoc,
  increment,
  query, 
  orderBy, 
  limit, 
  Firestore
} from 'firebase/firestore';
import { VideoData } from '@/types/video';

// Gets videos exactly like your working project
export const getFYPVideos = async (count = 10): Promise<VideoData[]> => {
  try {
    console.log('Fetching videos exactly like working project');
    
    if (!db) {
      console.error("Firestore not initialized");
      return [];
    }
    
    // Use the exact same query as your working project
    const videosRef = collection(db as Firestore, 'videos');
    const q = query(videosRef, orderBy('timestamp', 'desc'), limit(count));
    
    const querySnapshot = await getDocs(q);
    console.log(`Retrieved ${querySnapshot.docs.length} videos`);
    
    if (querySnapshot.empty) {
      console.error("No videos found in collection");
      return [];
    }
    
    // Map documents to VideoData objects exactly as in working project
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      console.log(`Processing video ${doc.id}`);
      console.log('Video URL:', data.url);
      
      return {
        id: doc.id,
        username: data.username || 'user',
        caption: data.caption || '',
        song: data.song || 'Original Sound',
        likes: data.likes || 0,
        comments: data.comments || 0,
        saves: data.saves || 0,
        shares: data.shares || 0,
        views: data.views || 0,
        videoUrl: data.url || '', // In your working project, it's 'url' not 'videoUrl'
        userAvatar: data.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg',
      };
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

// Increase view count
export const increaseViewCount = async (videoId: string) => {
  try {
    if (!db || !videoId) return;
    
    const videoRef = doc(db as Firestore, 'videos', videoId);
    await updateDoc(videoRef, {
      views: increment(1)
    });
    console.log(`Increased view count for video ${videoId}`);
  } catch (error) {
    console.error('Error tracking view:', error);
  }
};

// Reset pagination (kept for compatibility)
export const resetVideoFeed = () => {
  // Not needed
};
