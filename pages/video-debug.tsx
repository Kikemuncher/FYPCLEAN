// pages/video-debug.tsx
import { useEffect, useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

export default function VideoDebug() {
  const [status, setStatus] = useState('Testing...');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function directTest() {
      try {
        // Try to access a specific video directly with a known path
        const videoRef = ref(storage, 'videos/Snaptik.app_7420530930982423840.mp4');
        console.log('Created reference to video');
        setStatus('Getting download URL...');
        
        // Add timeout protection
        const urlPromise = getDownloadURL(videoRef);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timed out after 10 seconds')), 10000);
        });
        
        const url = await Promise.race([urlPromise, timeoutPromise]) as string;
        console.log('Got video URL:', url);
        setVideoUrl(url);
        setStatus('Success!');
      } catch (err) {
        console.error('Error:', err);
        setStatus('Error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }
    
    directTest();
  }, []);
  
  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Video Debug Test</h1>
      <div className="flex items-center mb-4">
        <div className={`w-4 h-4 rounded-full mr-2 ${
          status === 'Testing...' || status === 'Getting download URL...' 
            ? 'bg-yellow-500 animate-pulse' 
            : status === 'Success!' 
              ? 'bg-green-500' 
              : 'bg-red-500'
        }`}></div>
        <p>Status: <strong>{status}</strong></p>
      </div>
      
      {error && (
        <div className="bg-red-50 p-3 rounded border border-red-300 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {videoUrl ? (
        <div className="border rounded overflow-hidden">
          <video controls className="w-full h-auto">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="p-2 bg-gray-50 text-xs break-all">
            <strong>URL:</strong> {videoUrl}
          </div>
        </div>
      ) : status === 'Success!' ? (
        <div className="bg-yellow-50 p-3 rounded border border-yellow-300">
          <p>Got video URL but it appears to be empty.</p>
        </div>
      ) : null}
      
      <div className="mt-6 bg-blue-50 p-4 rounded border border-blue-200">
        <h2 className="font-semibold mb-2">Debug Information</h2>
        <p className="text-sm mb-2">This test attempts to directly load a single video from Firebase Storage.</p>
        <p className="text-sm">Check the browser console (F12 → Console tab) for detailed logs.</p>
      </div>
    </div>
  );
}
