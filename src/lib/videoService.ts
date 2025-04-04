import { db, storage } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  query,
  orderBy,
  where,
  limit
} from 'firebase/firestore';
import { VideoData } from '@/types/video';

// Get feed videos
export const getFeedVideos = async (): Promise<VideoData[]> => {
  try {
    // Get videos from Firebase
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
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
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
      views: increment(1)
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
      likes: increment(1),
      likedBy: arrayUnion(userId)
    });

    // Also update user's liked videos
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      likedVideos: arrayUnion(videoId),
      likeCount: increment(1)
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
      likes: increment(-1),
      likedBy: arrayRemove(userId)
    });

    // Also update user's liked videos
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      likedVideos: arrayRemove(videoId),
      likeCount: increment(-1)
    });

    return true;
  } catch (error) {
    console.error('Error unliking video:', error);
    return false;
  }
};

// Check if video is liked by user
export const isVideoLikedByUser = async (userId: string, videoId: string): Promise<boolean> => {
  try {
    const videoDocRef = doc(db, 'videos', videoId);
    const videoDoc = await getDoc(videoDocRef);

    if (videoDoc.exists()) {
      const data = videoDoc.data();
      const likedBy = data.likedBy || [];
      return likedBy.includes(userId);
    }

    return false;
  } catch (error) {
    console.error('Error checking if video is liked:', error);
    return false;
  }
};

// Get videos by user ID
export const getVideosByUser = async (userId: string): Promise<VideoData[]> => {
  try {
    const videosRef = collection(db, 'videos');
    const q = query(
      videosRef,
      where('creatorUid', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

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
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
      };
    });
  } catch (error) {
    console.error('Error fetching user videos:', error);
    return [];
  }
};

// Get videos by username
export const getVideosByUsername = async (username: string): Promise<VideoData[]> => {
  try {
    const videosRef = collection(db, 'videos');
    const q = query(
      videosRef,
      where('username', '==', username),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

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
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
      };
    });
  } catch (error) {
    console.error('Error fetching user videos by username:', error);
    return [];
  }
};
