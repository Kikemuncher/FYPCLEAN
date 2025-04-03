// src/lib/videoService.ts

import { db, storage } from './firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
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

// --- REMOVE ALL LOCAL STORAGE RELATED FUNCTIONS ---

// The following functions were removed, as they were related to local storage:
// - getAllVideos
// - createVideo
// - getVideosByCreator
// - getVideoById
// - deleteVideo
// - likeVideo
// - unlikeVideo
// - incrementVideoView
