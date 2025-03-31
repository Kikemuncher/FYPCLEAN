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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Step 1: Initialize Firebase
    console.log('Step 1: Initializing Firebase');
    const app = initializeApp(firebaseConfig, 'api-instance');
    
    // Step 2: Get Storage Reference
    console.log('Step 2: Getting Storage reference');
    const storage = getStorage(app);
    
    // Step 3: Create videos reference
    console.log('Step 3: Creating videos reference');
    const videosRef = ref(storage, 'videos/');
    
    // Step 4: List all videos
    console.log('Step 4: Listing videos from storage');
    try {
      const result = await listAll(videosRef);
      console.log(`Found ${result.items.length} videos`);
      
      if (result.items.length === 0) {
        return res.status(200).json({ videos: [], message: 'No videos found in storage' });
      }
      
      // Step 5: Get first video URL as test
      console.log('Step 5: Getting URL for first video as test');
      try {
        const firstItem = result.items[0];
        console.log(`Testing with video: ${firstItem.name}`);
        
        const videoUrl = await getDownloadURL(firstItem);
        console.log('Successfully got URL:', videoUrl.substring(0, 30) + '...');
        
        // Return success with just one video for testing
        return res.status(200).json({ 
          videos: [{
            id: firstItem.name,
            videoUrl,
            username: 'user',
            userAvatar: 'https://placehold.co/100x100',
            song: 'Test Song',
            caption: firstItem.name,
          }],
          message: 'Successfully loaded first video as test'
        });
      } catch (urlError) {
        console.error('Failed to get video URL:', urlError);
        return res.status(500).json({ 
          error: 'Got video list but failed to get download URL',
          message: urlError instanceof Error ? urlError.message : 'Unknown URL error'
        });
      }
    } catch (listError) {
      console.error('Failed to list videos:', listError);
      return res.status(500).json({ 
        error: 'Failed to list videos', 
        message: listError instanceof Error ? listError.message : 'Unknown listing error'
      });
    }
  } catch (error) {
    console.error('General error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch videos',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
