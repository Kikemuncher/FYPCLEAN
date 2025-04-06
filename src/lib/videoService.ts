// src/lib/videoService.ts
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { VideoData } from '@/types/video';
import { getUserById } from './userService';

// Upload a video to Firebase Storage
export const uploadVideo = async (
  userId: string,
  file: File,
  progressCallback?: (progress: number) => void
): Promise<string> => {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}_${userId}.${fileExtension}`;
    const storageRef = ref(storage, `videos/${fileName}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progressCallback) progressCallback(progress);
        },
        (error) => {
          console.error('Error uploading video:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in video upload:', error);
    throw error;
  }
};

// Create a new video document in Firestore
export const createVideoDocument = async (
  userId: string,
  videoUrl: string,
  data: {
    caption: string;
    song?: string;
    hashtags?: string[];
  }
): Promise<string> => {
  try {
    // Get user information
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const videoData = {
      creatorUid: userId,
      username: user.username,
      userAvatar: user.photoURL || '',
      videoUrl: videoUrl,
      caption: data.caption,
      song: data.song || 'Original Sound',
      hashtags: data.hashtags || [],
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      likedBy: [],
      createdAt: serverTimestamp()
    };

    // Add to videos collection
    const videoRef = collection(db, 'videos');
    const newVideo = await addDoc(videoRef, videoData);

    // Update user's video count
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      videoCount: increment(1)
    });

    return newVideo.id;
  } catch (error) {
    console.error('Error creating video document:', error);
    throw error;
  }
};

// Get feed videos for FYP
export const getFeedVideos = async (
  lastVisibleDoc?: QueryDocumentSnapshot<DocumentData>,
  pageSize: number = 10
): Promise<{videos: VideoData[], lastVisible: QueryDocumentSnapshot<DocumentData> | null}> => {
  try {
    let videosQuery;
    
    if (lastVisibleDoc) {
      videosQuery = query(
        collection(db, 'videos'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisibleDoc),
        limit(pageSize)
      );
    } else {
      videosQuery = query(
        collection(db, 'videos'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }
    
    const querySnapshot = await getDocs(videosQuery);
    
    const videos: VideoData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      videos.push({
        id: doc.id,
        username: data.username || '',
        caption: data.caption || '',
        song: data.song || 'Original Sound',
        likes: data.likes || 0,
        comments: data.comments || 0,
        saves: data.saves || 0,
        shares: data.shares || 0,
        views: data.views || 0,
        videoUrl: data.videoUrl || '',
        userAvatar: data.userAvatar || '',
        hashtags: data.hashtags || [],
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
        creatorUid: data.creatorUid || ''
      });
    });
    
    const lastVisible = querySnapshot.docs.length > 0 ? 
      querySnapshot.docs[querySnapshot.docs.length - 1] : null;
      
    return { videos, lastVisible };
  } catch (error) {
    console.error('Error fetching feed videos:', error);
    return { videos: [], lastVisible: null };
  }
};

// Get video by ID
export const getVideoById = async (videoId: string): Promise<VideoData | null> => {
  try {
    const videoDoc = await getDoc(doc(db, 'videos', videoId));
    
    if (!videoDoc.exists()) {
      return null;
    }
    
    const data = videoDoc.data();
    return {
      id: videoDoc.id,
      username: data.username || '',
      caption: data.caption || '',
      song: data.song || 'Original Sound',
      likes: data.likes || 0,
      comments: data.comments || 0,
      saves: data.saves || 0,
      shares: data.shares || 0,
      views: data.views || 0,
      videoUrl: data.videoUrl || '',
      userAvatar: data.userAvatar || '',
      hashtags: data.hashtags || [],
      createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
      creatorUid: data.creatorUid || ''
    };
  } catch (error) {
    console.error('Error getting video by ID:', error);
    return null;
  }
};

// Get videos by user
export const getVideosByUsername = async (username: string): Promise<VideoData[]> => {
  try {
    const videosQuery = query(
      collection(db, 'videos'),
      where('username', '==', username),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(videosQuery);
    
    const videos: VideoData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      videos.push({
        id: doc.id,
        username: data.username || '',
        caption: data.caption || '',
        song: data.song || 'Original Sound',
        likes: data.likes || 0,
        comments: data.comments || 0,
        saves: data.saves || 0,
        shares: data.shares || 0,
        views: data.views || 0,
        videoUrl: data.videoUrl || '',
        userAvatar: data.userAvatar || '',
        hashtags: data.hashtags || [],
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
        creatorUid: data.creatorUid || ''
      });
    });
    
    return videos;
  } catch (error) {
    console.error('Error fetching user videos:', error);
    return [];
  }
};

// Increment view count
export const incrementVideoView = async (videoId: string): Promise<boolean> => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    await updateDoc(videoRef, {
      views: increment(1)
    });
    return true;
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return false;
  }
};

// Like a video
export const likeVideo = async (userId: string, videoId: string): Promise<boolean> => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoDoc = await getDoc(videoRef);
    
    if (!videoDoc.exists()) {
      return false;
    }
    
    // Update video document
    await updateDoc(videoRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId)
    });
    
    // Update user's liked videos
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      likedVideos: arrayUnion(videoId),
      likeCount: increment(1)
    });
    
    // Add notification for video creator
    const data = videoDoc.data();
    const creatorUid = data.creatorUid;
    
    if (creatorUid && creatorUid !== userId) {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        type: 'like',
        videoId,
        fromUserId: userId,
        toUserId: creatorUid,
        read: false,
        createdAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error liking video:', error);
    return false;
  }
};

// Unlike a video
export const unlikeVideo = async (userId: string, videoId: string): Promise<boolean> => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    
    // Update video document
    await updateDoc(videoRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId)
    });
    
    // Update user's liked videos
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      likedVideos: arrayRemove(videoId),
      likeCount: increment(-1)
    });
    
    return true;
  } catch (error) {
    console.error('Error unliking video:', error);
    return false;
  }
};

// Check if user has liked a video
export const isVideoLikedByUser = async (userId: string, videoId: string): Promise<boolean> => {
  try {
    const videoDoc = await getDoc(doc(db, 'videos', videoId));
    
    if (!videoDoc.exists()) {
      return false;
    }
    
    const data = videoDoc.data();
    const likedBy = data.likedBy || [];
    
    return likedBy.includes(userId);
  } catch (error) {
    console.error('Error checking if video is liked:', error);
    return false;
  }
};

// Delete a video
export const deleteVideo = async (videoId: string, userId: string): Promise<boolean> => {
  try {
    // Get video data to get the storage URL
    const videoDoc = await getDoc(doc(db, 'videos', videoId));
    
    if (!videoDoc.exists()) {
      return false;
    }
    
    const videoData = videoDoc.data();
    
    // Check if user is the owner
    if (videoData.creatorUid !== userId) {
      throw new Error('Not authorized to delete this video');
    }
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'videos', videoId));
    
    // Update user's video count
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      videoCount: increment(-1)
    });
    
    // Try to delete from Storage if possible
    try {
      const videoUrl = videoData.videoUrl;
      if (videoUrl) {
        // Extract the path from the URL
        const storageRef = ref(storage, videoUrl);
        await deleteObject(storageRef);
      }
    } catch (storageError) {
      console.error('Error deleting video file from storage:', storageError);
      // Continue anyway since the document is already deleted
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting video:', error);
    return false;
  }
};

// Add a comment to a video
export const addComment = async (
  userId: string,
  videoId: string,
  comment: string
): Promise<string | null> => {
  try {
    // Get user info
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    
    // Get video info
    const videoDoc = await getDoc(doc(db, 'videos', videoId));
    
    if (!videoDoc.exists()) {
      return null;
    }
    
    // Create the comment
    const commentsRef = collection(db, 'comments');
    const commentDoc = await addDoc(commentsRef, {
      videoId,
      userId,
      username: userData.username,
      userAvatar: userData.photoURL,
      comment,
      likes: 0,
      createdAt: serverTimestamp()
    });
    
    // Update video comment count
    await updateDoc(doc(db, 'videos', videoId), {
      comments: increment(1),
      commenters: arrayUnion(userId)
    });
    
    // Add notification for video creator
    const videoData = videoDoc.data();
    const creatorUid = videoData.creatorUid;
    
    if (creatorUid && creatorUid !== userId) {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        type: 'comment',
        videoId,
        commentId: commentDoc.id,
        fromUserId: userId,
        toUserId: creatorUid,
        comment: comment.length > 50 ? comment.substring(0, 50) + '...' : comment,
        read: false,
        createdAt: serverTimestamp()
      });
    }
    
    return commentDoc.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};

// Get comments for a video
export const getVideoComments = async (videoId: string): Promise<any[]> => {
  try {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('videoId', '==', videoId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(commentsQuery);
    
    const comments: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
      });
    });
    
    return comments;
  } catch (error) {
    console.error('Error fetching video comments:', error);
    return [];
  }
};

// Share video
export const incrementShareCount = async (videoId: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'videos', videoId), {
      shares: increment(1)
    });
    return true;
  } catch (error) {
    console.error('Error incrementing share count:', error);
    return false;
  }
};
