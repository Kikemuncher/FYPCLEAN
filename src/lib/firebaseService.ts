// src/lib/firebaseService.ts
import { firebaseApp, db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  increment,
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { VideoData } from '@/types/video';

// Get videos from Firebase - matches structure from your working project
export const getFYPVideos = async (count = 10): Promise<VideoData[]> => {
  try {
    console.log('Fetching videos from Firebase collection');
    
    if (!db) {
      console.error("Firestore not initialized");
      return [];
    }
    
    // Match the query structure from your working project
    const videosQuery = query(
      collection(db as Firestore, 'videos'),
      orderBy('timestamp', 'desc'), // Using timestamp instead of createdAt
      limit(count)
    );
    
    const snapshot = await getDocs(videosQuery);
    console.log(`Retrieved ${snapshot.docs.length} videos`);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Map the data structure to match your VideoData type
      const video: VideoData = {
        id: doc.id,
        username: data.username || 'user',
        caption: data.caption || '',
        song: data.song || 'Original Sound',
        likes: data.likes || 0,
        comments: data.comments || 0,
        saves: data.saves || 0,
        shares: data.shares || 0,
        views: data.views || 0,
        videoUrl: data.url || '', // Note: using 'url' field, not 'videoUrl'
        userAvatar: data.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg',
      };
      
      // Debug log to check what we're getting
      console.log(`Video ${doc.id} URL: ${video.videoUrl}`);
      
      return video;
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
      views: increment(1),
      lastViewed: Timestamp.now()
    });
  } catch (error) {
    console.error('Error tracking view:', error);
  }
};

// Reset pagination (not used anymore but kept for API compatibility)
export const resetVideoFeed = () => {
  // Nothing needed here
};
