// pages/api/get-videos.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';

// Firebase configuration (same as your lib/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
  authDomain: "tiktok-a7af5.firebaseapp.com",
  projectId: "tiktok-a7af5",
  storageBucket: "tiktok-a7af5.appspot.com",
  messagingSenderId: "609721475346",
  appId: "1:609721475346:web:c80084600ed104b6b153cb"
};

// Simple in-memory cache
let cachedVideos: any[] = [];
let lastFetched: number = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Return cached videos if available and not expired
    const now = Date.now();
    if (cachedVideos.length > 0 && (now - lastFetched) < CACHE_DURATION) {
      console.log('Returning cached videos');
      return res.status(200).json({ videos: cachedVideos });
    }

    // Initialize Firebase
    const app = initializeApp(firebaseConfig, 'api-instance');
    const storage = getStorage(app);
    
    // Get videos from Firebase Storage
    const videosRef = ref(storage, 'videos/');
    const result = await listAll(videosRef);
    
    // Fetch download URLs
    const videos = [];
    for (const item of result.items) {
      try {
        const videoUrl = await getDownloadURL(item);
        videos.push({
          id: item.name,
          videoUrl,
          username: 'user',
          userAvatar: 'https://placehold.co/100x100',
          song: 'Unknown Song',
          caption: item.name.replace(/\.\w+$/, ''),
        });
      } catch (error) {
        console.error(`Error getting URL for ${item.name}:`, error);
      }
    }
    
    // Update cache
    cachedVideos = videos;
    lastFetched = now;
    
    res.status(200).json({ videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
}
