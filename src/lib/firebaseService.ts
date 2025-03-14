// src/lib/alternateFirebaseService.ts
import { 
  initializeApp, 
  getApps 
} from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc,
  updateDoc,
  increment,
  query, 
  orderBy, 
  limit
} from 'firebase/firestore';
import { VideoData } from '@/types/video';

// Directly initialize Firebase instead of using imported variables
// This eliminates any potential cross-project issues
const getDirectFirestore = () => {
  try {
    // Use exact config from your working project
    const firebaseConfig = {
      apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
      authDomain: "tiktok-a7af5.firebaseapp.com",
      projectId: "tiktok-a7af5",
      storageBucket: "tiktok-a7af5.appspot.com",
      messagingSenderId: "609721475346",
      appId: "1:609721475346:web:c80084600ed104b6b153cb",
      measurementId: "G-3Z96CKXW1W"
    };
    
    // Initialize the app directly
    let app;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    // Return the Firestore instance
    return getFirestore(app);
  } catch (error) {
    console.error('Error initializing direct Firestore:', error);
    return null;
  }
};

// Get videos using direct Firestore instance
export const getFYPVideos = async (count = 10): Promise<VideoData[]> => {
  try {
    console.log('Getting videos using direct Firestore instance');
    
    // Get a direct Firestore instance
    const db = getDirectFirestore();
    
    if (!db) {
      console.error("Direct Firestore initialization failed");
      return [];
    }
    
    // Execute the query exactly like in working project
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, orderBy('timestamp', 'desc'), limit(count));
    
    const querySnapshot = await getDocs(q);
    console.log(`Retrieved ${querySnapshot.docs.length} videos`);
    
    // Map to VideoData objects
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
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
        videoUrl: data.url || '', // Use url field as in working project
        userAvatar: data.profilePic || 'https://randomuser.me/api/portraits/lego/1.jpg',
      };
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

// Increase view count with direct Firestore
export const directIncreaseViewCount = async (videoId: string) => {
  try {
    if (!videoId) return;
    
    // Get direct Firestore
    const db = getDirectFirestore();
    if (!db) return;
    
    const videoRef = doc(db, 'videos', videoId);
    await updateDoc(videoRef, {
      views: increment(1)
    });
    console.log(`Increased view count for ${videoId}`);
  } catch (error) {
    console.error('Error tracking view:', error);
  }
};
