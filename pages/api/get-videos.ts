// pages/api/videos-direct.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Config with full explicit bucket URL
    const firebaseConfig = {
      apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
      authDomain: "tiktok-a7af5.firebaseapp.com",
      projectId: "tiktok-a7af5",
      storageBucket: "tiktok-a7af5.appspot.com",
      messagingSenderId: "609721475346",
      appId: "1:609721475346:web:c80084600ed104b6b153cb"
    };

    // Initialize with a unique name to avoid conflicts
    const app = initializeApp(firebaseConfig, 'direct-test-' + Date.now());
    
    // Get storage with explicit bucket URL
    const storage = getStorage(app, "gs://tiktok-a7af5.appspot.com");
    
    // Try to access a specific known video directly
    const videoRef = ref(storage, "videos/Snaptik.app_7420530930982423840.mp4");
    
    try {
      const url = await getDownloadURL(videoRef);
      
      res.status(200).json({
        success: true,
        url: url,
        message: "Successfully retrieved video URL"
      });
    } catch (urlError) {
      res.status(500).json({
        success: false,
        error: "Failed to get download URL",
        message: urlError instanceof Error ? urlError.message : "Unknown error",
        videoPath: videoRef.fullPath
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "General failure",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
