// pages/api/list-all-files.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll } from 'firebase/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const firebaseConfig = {
      apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
      authDomain: "tiktok-a7af5.firebaseapp.com",
      projectId: "tiktok-a7af5",
      storageBucket: "tiktok-a7af5.appspot.com",
      messagingSenderId: "609721475346",
      appId: "1:609721475346:web:c80084600ed104b6b153cb"
    };

    const app = initializeApp(firebaseConfig, 'list-all-' + Date.now());
    const storage = getStorage(app);
    
    // List all files at the root level
    const rootRef = ref(storage, '');
    const rootResult = await listAll(rootRef);
    
    // Try to list files in the videos folder
    let videosResult = null;
    try {
      const videosRef = ref(storage, 'videos');
      videosResult = await listAll(videosRef);
    } catch (e) {
      console.error('Error listing videos folder:', e);
    }
    
    res.status(200).json({
      rootFolders: rootResult.prefixes.map(folder => folder.fullPath),
      rootFiles: rootResult.items.map(file => file.fullPath),
      videosFolder: videosResult ? {
        folders: videosResult.prefixes.map(folder => folder.fullPath),
        files: videosResult.items.map(file => file.fullPath)
      } : null
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to list files",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
