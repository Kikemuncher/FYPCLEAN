import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase using Next.js best practices
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Check connection to firebase infrastructure
const checkFirebaseConnection = async () => {
  try {
    // Try to connect directly to Firebase endpoints with fetch
    const response = await fetch("https://firestore.googleapis.com/", { 
      method: 'OPTIONS',
      mode: 'no-cors',
      cache: 'no-store'
    });
    return true;
  } catch (e) {
    console.error("Firebase connection check failed:", e);
    return false;
  }
};

// Direct file upload/download without Firebase SDK
const directUpload = async (file, path) => {
  // Create a FormData object
  const formData = new FormData();
  formData.append('file', file);
  
  // Use direct fetch to upload
  try {
    const response = await fetch(`https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${encodeURIComponent(path)}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
      }
    });
    
    return await response.json();
  } catch (e) {
    console.error("Direct upload failed:", e);
    throw e;
  }
};

// Direct access functions to bypass Firebase SDK restrictions
export async function fetchVideoDirectly(videoPath) {
  // Use CORS proxy if needed
  const useProxy = process.env.NEXT_PUBLIC_USE_CORS_PROXY === 'true';
  const proxyUrl = process.env.NEXT_PUBLIC_CORS_PROXY_URL || 'https://corsproxy.io/?';
  
  try {
    // Create a direct URL to the video
    const videoUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${encodeURIComponent(videoPath)}?alt=media`;
    
    // Use proxy if enabled
    const fetchUrl = useProxy ? `${proxyUrl}${encodeURIComponent(videoUrl)}` : videoUrl;
    
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    // Return the direct URL to the video
    return useProxy ? fetchUrl : videoUrl;
  } catch (error) {
    console.error("Error fetching video directly:", error);
    throw error;
  }
}

// Sample videos to use when Firebase is inaccessible
export const SAMPLE_VIDEOS = [
  {
    id: 'sample1',
    name: 'Sample Video 1',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: 'sample2',
    name: 'Sample Video 2',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  },
  {
    id: 'sample3',
    name: 'Sample Video 3',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  }
];

export { app, auth, db, storage, checkFirebaseConnection, directUpload };
