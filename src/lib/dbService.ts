import { 
  doc, 
  collection, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

// ------ USER OPERATIONS ------

// Get user profile
export const getUserProfile = async (userId: string) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() };
  }
  return null;
};

// Update user profile
export const updateUserProfile = async (userId: string, data: any) => {
  await updateDoc(doc(db, 'users', userId), {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// Upload profile picture
export const uploadProfilePicture = async (userId: string, file: File) => {
  const storageRef = ref(storage, `profiles/${userId}/profile-picture`);
  await uploadBytes(storageRef, file);
  
  // Get download URL
  const downloadURL = await getDownloadURL(storageRef);
  
  // Update user document with photo URL
  await updateDoc(doc(db, 'users', userId), {
    photoURL: downloadURL,
    updatedAt: serverTimestamp()
  });
  
  return downloadURL;
};

// ------ VIDEO OPERATIONS ------

// Upload video
export const uploadVideo = async (userId: string, file: File, caption: string) => {
  // Create a unique filename
  const filename = `${Date.now()}-${file.name}`;
  const storagePath = `videos/${userId}/${filename}`;
  const storageRef = ref(storage, storagePath);
  
  // Upload to Firebase Storage
  await uploadBytes(storageRef, file);
  
  // Get download URL
  const downloadURL = await getDownloadURL(storageRef);
  
  // Create document in Firestore
  const videoRef = await addDoc(collection(db, 'videos'), {
    userId: userId,
    caption: caption,
    storagePath: storagePath,
    videoUrl: downloadURL,
    createdAt: serverTimestamp(),
    likes: 0,
    comments: 0
  });
  
  return videoRef.id;
};

// Get videos for feed
export const getVideosFeed = async (limitCount = 10) => {
  const q = query(
    collection(db, 'videos'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Get user videos
export const getUserVideos = async (userId: string) => {
  const q = query(
    collection(db, 'videos'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Delete video
export const deleteVideo = async (videoId: string, storagePath: string) => {
  // Delete from Firestore
  await deleteDoc(doc(db, 'videos', videoId));
  
  // Delete from Storage
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
};

// ------ LIKES OPERATIONS ------

// Like a video
export const likeVideo = async (userId: string, videoId: string) => {
  // Add like document
  await addDoc(collection(db, 'likes'), {
    userId: userId,
    videoId: videoId,
    createdAt: serverTimestamp()
  });
  
  // Increment likes count on video
  await updateDoc(doc(db, 'videos', videoId), {
    likes: increment(1)
  });
};

// Unlike a video
export const unlikeVideo = async (userId: string, videoId: string) => {
  // Find the like document
  const q = query(
    collection(db, 'likes'),
    where('userId', '==', userId),
    where('videoId', '==', videoId)
  );
  
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    // Delete the like document
    await deleteDoc(doc(db, 'likes', snapshot.docs[0].id));
    
    // Decrement likes count on video
    await updateDoc(doc(db, 'videos', videoId), {
      likes: increment(-1)
    });
  }
};

// Check if user liked a video
export const hasUserLikedVideo = async (userId: string, videoId: string) => {
  const q = query(
    collection(db, 'likes'),
    where('userId', '==', userId),
    where('videoId', '==', videoId)
  );
  
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// ------ COMMENTS OPERATIONS ------

// Add comment
export const addComment = async (userId: string, videoId: string, text: string) => {
  // Add comment document
  const commentRef = await addDoc(collection(db, 'comments'), {
    userId: userId,
    videoId: videoId,
    text: text,
    createdAt: serverTimestamp()
  });
  
  // Increment comments count on video
  await updateDoc(doc(db, 'videos', videoId), {
    comments: increment(1)
  });
  
  return commentRef.id;
};

// Get comments for a video
export const getVideoComments = async (videoId: string) => {
  const q = query(
    collection(db, 'comments'),
    where('videoId', '==', videoId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Delete comment
export const deleteComment = async (commentId: string, videoId: string) => {
  // Delete comment document
  await deleteDoc(doc(db, 'comments', commentId));
  
  // Decrement comments count on video
  await updateDoc(doc(db, 'videos', videoId), {
    comments: increment(-1)
  });
};
