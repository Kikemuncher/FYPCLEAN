// pages/direct-test.jsx
import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';

export default function DirectTest() {
  const [status, setStatus] = useState('Loading...');
  const [videoUrl, setVideoUrl] = useState('');
  
  useEffect(() => {
    async function testFirebase() {
      try {
        setStatus('Initializing Firebase...');
        
        // Initialize Firebase with your config
        const firebaseConfig = {
          apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
          authDomain: "tiktok-a7af5.firebaseapp.com",
          projectId: "tiktok-a7af5",
          storageBucket: "tiktok-a7af5.firebasestorage.app",
          messagingSenderId: "609721475346",
          appId: "1:609721475346:web:c80084600ed104b6b153cb",
          measurementId: "G-3Z96CKXW1W"
        };
        
        const app = initializeApp(firebaseConfig);
        const storage = getStorage(app);
        
        setStatus('Listing videos folder...');
        const videosRef = ref(storage, 'videos');
        const result = await listAll(videosRef);
        
        setStatus(`Found ${result.items.length} videos, getting first video URL...`);
        
        if (result.items.length > 0) {
          const firstVideo = result.items[0];
          setStatus(`Getting URL for ${firstVideo.name}...`);
          
          const url = await getDownloadURL(firstVideo);
          setVideoUrl(url);
          setStatus('Success!');
        } else {
          setStatus('No videos found in the folder');
        }
      } catch (error) {
        console.error('Error:', error);
        setStatus(`Error: ${error.message || 'Unknown error'}`);
      }
    }
    
    testFirebase();
  }, []);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Direct Firebase Storage Test</h1>
      <p className="mb-4">Status: {status}</p>
      
      {videoUrl && (
        <div className="border rounded overflow-hidden max-w-md">
          <video controls className="w-full h-auto">
            <source src={videoUrl} type="video/mp4" />
            Your browser doesn't support video playback.
          </video>
          <div className="p-2 bg-gray-50 break-all text-xs">
            <p>{videoUrl}</p>
          </div>
        </div>
      )}
    </div>
  );
}
