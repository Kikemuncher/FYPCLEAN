// pages/api/firebase-test.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Configuration directly from your GS URL
    const firebaseConfig = {
      apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
      authDomain: "tiktok-a7af5.firebaseapp.com",
      projectId: "tiktok-a7af5",
      storageBucket: "tiktok-a7af5.firebasestorage.app",
      messagingSenderId: "609721475346",
      appId: "1:609721475346:web:c80084600ed104b6b153cb"
    };

    // Initialize with unique name to avoid conflicts
    const app = initializeApp(firebaseConfig, 'test-' + Date.now());
    
    // Get storage with explicit options
    const storage = getStorage(app);
    
    // Try accessing with full path including gs://
    const fullPath = "gs://tiktok-a7af5.firebasestorage.app/videos/Snaptik.app_7420530930982423840.mp4";
    
    // Try using direct HTTP URL method instead
    const directPath = "https://firebasestorage.googleapis.com/v0/b/tiktok-a7af5.appspot.com/o/videos%2FSnaptik.app_7420530930982423840.mp4?alt=media";
    
    res.status(200).json({
      message: "Testing alternative approaches",
      config: {
        storageBucket: firebaseConfig.storageBucket
      },
      fullPath,
      directPath,
      note: "Try accessing the directPath URL directly in your browser to see if it works"
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
