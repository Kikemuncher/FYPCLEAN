// pages/video-debug.tsx
import { useEffect, useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

export default function VideoDebug() {
  const [status, setStatus] = useState('Testing...');
  const [videoUrl, setVideoUrl] = useState('');
  
  useEffect(() => {
    async function directTest() {
      try {
        // Try to access a specific video directly with a known path
        const videoRef = ref(storage, 'videos/Snaptik.app_7420530930982423840.mp4');
        console.log('Created reference to video');
        setStatus('Getting download URL...');
        
        const url = await getDownloadURL(videoRef);
        console.log('Got video URL:', url);
        setVideoUrl(url);
        setStatus('Success!');
      } catch (err) {
        console.error('Error:', err);
        setStatus(`Error: ${err.message || 'Unknown error'}`);
      }
    }
    
    directTest();
  }, []);
  
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Video Debug Test</h1>
      <p className="mb-4">Status: {status}</p>
      
      {videoUrl && (
        <div>
          <video controls width="400" height="300" className="border">
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
      )}
    </div>
  );
}
