import { db } from './firebase';
import { 
  doc, 
  collection, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp
} from 'firebase/firestore';

// Add a comment to a video
export const addComment = async (userId: string, videoId: string, text: string) => {
  try {
    const commentsRef = collection(db, 'comments');
    const commentDoc = await addDoc(commentsRef, {
      userId,
      videoId,
      text,
      createdAt: serverTimestamp(),
      likes: 0
    });
    
    // Update comment count on video
    const videoRef = doc(db, 'videos', videoId);
    await updateDoc(videoRef, {
      comments: increment(1)
    });
    
    return commentDoc.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Get comments for a video
export const getVideoComments = async (videoId: string) => {
  try {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('videoId', '==', videoId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
};

// Additional interaction functions could be added here
