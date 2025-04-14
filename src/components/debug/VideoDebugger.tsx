'use client';

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  listAll, 
  getDownloadURL 
} from 'firebase/storage';

export default function VideoDebugger() {
  const [storageVideos, setStorageVideos] = useState<any[]>([]);
  const [firestoreVideos, setFirestoreVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const scanStorage = async () => {
    setLoading(true);
    setMessage('Scanning Firebase Storage...');
    
    try {
      // These are sample paths that might contain videos
      const possiblePaths = [
        'videos',
        'video',
        'media',
        'uploads',
        ''  // Root directory
      ];
      
      let foundVideos: any[] = [];
      
      // Try each possible path
      for (const path of possiblePaths) {
        try {
          const storageRef = ref(storage, path);
          const result = await listAll(storageRef);
          
          // If this is a root folder with subfolders
          if (result.prefixes.length > 0) {
            setMessage(`Found ${result.prefixes.length} folders in /${path}`);
            
            // Check the first level of subfolders
            for (const folderRef of result.prefixes) {
              try {
                const folderResult = await listAll(folderRef);
                
                if (folderResult.items.length > 0) {
                  setMessage(`Found ${folderResult.items.length} files in /${path}/${folderRef.name}`);
                  
                  // Get URLs for video files
                  for (const itemRef of folderResult.items) {
                    if (itemRef.name.endsWith('.mp4') || 
                        itemRef.name.endsWith('.mov') || 
                        itemRef.name.endsWith('.webm')) {
                      try {
                        const url = await getDownloadURL(itemRef);
                        foundVideos.push({
                          name: itemRef.name,
                          path: `/${path}/${folderRef.name}/${itemRef.name}`,
                          url: url
                        });
                      } catch (e) {
                        console.log(`Error getting URL for ${itemRef.name}:`, e);
                      }
                    }
                  }
                }
              } catch (e) {
                console.log(`Error scanning folder ${folderRef.name}:`, e);
              }
            }
          }
          
          // Check for files directly in this path
          for (const itemRef of result.items) {
            if (itemRef.name.endsWith('.mp4') || 
                itemRef.name.endsWith('.mov') || 
                itemRef.name.endsWith('.webm')) {
              try {
                const url = await getDownloadURL(itemRef);
                foundVideos.push({
                  name: itemRef.name,
                  path: `/${path}/${itemRef.name}`,
                  url: url
                });
              } catch (e) {
                console.log(`Error getting URL for ${itemRef.name}:`, e);
              }
            }
          }
        } catch (e) {
          console.log(`Path /${path} not found or access denied:`, e);
        }
      }
      
      setStorageVideos(foundVideos);
      
      if (foundVideos.length > 0) {
        setMessage(`Found ${foundVideos.length} videos in storage!`);
      } else {
        setMessage('No videos found in Firebase Storage. Try adding sample videos.');
      }
    } catch (error) {
      console.error('Error scanning storage:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const scanFirestore = async () => {
    setLoading(true);
    setMessage('Scanning Firestore...');
    
    try {
      const videosRef = collection(db, 'videos');
      const q = query(videosRef);
      const querySnapshot = await getDocs(q);
      
      const videos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setFirestoreVideos(videos);
      
      if (videos.length > 0) {
        setMessage(`Found ${videos.length} videos in Firestore!`);
      } else {
        setMessage('No videos found in Firestore.');
      }
    } catch (error) {
      console.error('Error scanning Firestore:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const addSampleVideos = async () => {
    setLoading(true);
    setMessage('Adding sample videos...');
    
    try {
      // These are public demo videos that are guaranteed to work
      const sampleVideos = [
        {
          url: "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-changing-lights-1240-large.mp4",
          caption: "Dancing Under Lights"
        },
        {
          url: "https://assets.mixkit.co/videos/preview/mixkit-woman-running-above-the-camera-1264-large.mp4",
          caption: "Running Woman"
        },
        {
          url: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-waving-her-hands-1169-large.mp4",
          caption: "Waving Hands"
        },
        {
          url: "https://assets.mixkit.co/videos/preview/mixkit-man-breakdancing-365-large.mp4",
          caption: "Breakdance"
        },
        {
          url: "https://assets.mixkit.co/videos/preview/mixkit-woman-posing-for-the-camera-1259-large.mp4",
          caption: "Camera Pose"
        }
      ];
      
      // Add sample videos to Firestore
      const videosRef = collection(db, 'videos');
      const addedVideos = [];
      
      for (const video of sampleVideos) {
        const docRef = await addDoc(videosRef, {
          videoUrl: video.url,
          caption: video.caption,
          username: "demouser",
          userId: "demo123",
          likes: [],
          comments: 0,
          shares: 0,
          views: 0,
          createdAt: serverTimestamp(),
          song: "Original Sound",
          status: "active",
          isPrivate: false
        });
        
        addedVideos.push({
          id: docRef.id,
          ...video
        });
      }
      
      setMessage(`Added ${addedVideos.length} sample videos to Firestore!`);
      // Refresh Firestore videos list
      scanFirestore();
    } catch (error) {
      console.error('Error adding sample videos:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    scanFirestore();
  }, []);
  
  return (
    <div className="bg-zinc-900 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Video Debugger</h2>
      
      <div className="flex space-x-3 mb-6">
        <button
          onClick={scanStorage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
        >
          {loading ? 'Scanning...' : 'Scan Storage'}
        </button>
        
        <button
          onClick={scanFirestore}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
        >
          {loading ? 'Scanning...' : 'Scan Firestore'}
        </button>
        
        <button
          onClick={addSampleVideos}
          disabled={loading}
          className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Sample Videos'}
        </button>
      </div>
      
      {message && (
        <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
          <p className="text-white">{message}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="bg-zinc-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-white">Firebase Storage Videos</h3>
          {storageVideos.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {storageVideos.map((video, index) => (
                <div key={index} className="border border-zinc-700 rounded-md p-3">
                  <p className="text-white text-sm font-bold">{video.name}</p>
                  <p className="text-zinc-400 text-xs mb-2">{video.path}</p>
                  <div className="aspect-video bg-zinc-900 rounded overflow-hidden">
                    <video
                      src={video.url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400">No storage videos found or not scanned yet.</p>
          )}
        </div>
        
        <div className="bg-zinc-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-white">Firestore Videos</h3>
          {firestoreVideos.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {firestoreVideos.map((video) => (
                <div key={video.id} className="border border-zinc-700 rounded-md p-3">
                  <p className="text-white text-sm font-bold">{video.caption || 'No caption'}</p>
                  <p className="text-zinc-400 text-xs mb-2">ID: {video.id}</p>
                  <div className="aspect-video bg-zinc-900 rounded overflow-hidden">
                    <video
                      src={video.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400">No Firestore videos found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
