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
  Firestore,
  collectionGroup
} from 'firebase/firestore';
import { VideoData } from '@/types/video';

// Get videos with extensive debugging
export const getFYPVideos = async (count = 10): Promise<VideoData[]> => {
  try {
    console.log('Attempting to fetch videos from Firebase', { count, hasDB: !!db });
    
    if (!db) {
      console.error("Firestore database not initialized");
      return [];
    }
    
    // Try multiple possible collection paths and field names
    // This helps us identify the correct structure
    
    // First try - standard 'videos' collection with timestamp
    try {
      console.log("Trying 'videos' collection with timestamp order");
      const videosQuery1 = query(
        collection(db as Firestore, 'videos'),
        orderBy('timestamp', 'desc'), 
        limit(count)
      );
      
      const snapshot1 = await getDocs(videosQuery1);
      console.log(`Query 1 returned ${snapshot1.docs.length} videos`);
      
      if (snapshot1.docs.length > 0) {
        console.log("Sample doc fields from query 1:", Object.keys(snapshot1.docs[0].data()));
        
        return snapshot1.docs.map(doc => {
          const data = doc.data();
          
          // Log all fields to help debug
          console.log(`Video ${doc.id} fields:`, Object.keys(data));
          console.log(`Video URL field:`, data.url || data.videoUrl || 'missing');
          
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
            videoUrl: data.url || data.videoUrl || '', // Try multiple field names
            userAvatar: data.profilePic || data.userAvatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
          };
          
          return video;
        });
      }
    } catch (e) {
      console.error("Error in query 1:", e);
    }
    
    // Second try - with 'createdAt' field
    try {
      console.log("Trying 'videos' collection with createdAt order");
      const videosQuery2 = query(
        collection(db as Firestore, 'videos'),
        orderBy('createdAt', 'desc'), 
        limit(count)
      );
      
      const snapshot2 = await getDocs(videosQuery2);
      console.log(`Query 2 returned ${snapshot2.docs.length} videos`);
      
      if (snapshot2.docs.length > 0) {
        console.log("Sample doc fields from query 2:", Object.keys(snapshot2.docs[0].data()));
        
        return snapshot2.docs.map(doc => {
          const data = doc.data();
          
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
            videoUrl: data.url || data.videoUrl || '', // Try multiple field names
            userAvatar: data.profilePic || data.userAvatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
          };
          
          return video;
        });
      }
    } catch (e) {
      console.error("Error in query 2:", e);
    }
    
    // Third try - collection group query to find videos anywhere
    try {
      console.log("Trying collection group query for 'videos'");
      const videosQuery3 = query(
        collectionGroup(db as Firestore, 'videos'),
        limit(count)
      );
      
      const snapshot3 = await getDocs(videosQuery3);
      console.log(`Query 3 returned ${snapshot3.docs.length} videos`);
      
      if (snapshot3.docs.length > 0) {
        console.log("Sample doc fields from query 3:", Object.keys(snapshot3.docs[0].data()));
        console.log("Sample doc path:", snapshot3.docs[0].ref.path);
        
        return snapshot3.docs.map(doc => {
          const data = doc.data();
          
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
            videoUrl: data.url || data.videoUrl || '', // Try multiple field names
            userAvatar: data.profilePic || data.userAvatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
          };
          
          return video;
        });
      }
    } catch (e) {
      console.error("Error in query 3:", e);
    }
    
    console.log("All queries failed to return videos");
    return [];
    
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

// Reset pagination
export const resetVideoFeed = () => {
  // Nothing needed here
};
