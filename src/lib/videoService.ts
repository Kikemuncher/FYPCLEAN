// src/lib/videoService.ts
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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

// Get feed videos
export const getFeedVideos = async (
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  limit: number = 10
): Promise<{
