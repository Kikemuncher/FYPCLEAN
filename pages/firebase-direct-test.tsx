// pages/direct-video-test.tsx
import { useEffect, useState } from 'react';
import { getApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

export default function DirectVideoTest() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSingleVideo() {
      try {
        console.log('Starting direct video test');
        const app = getApp();
        console.log('Got Firebase app');
        
        const storage = getStorage(app);
        console.log('Got storage reference');
        
        // Try with a direct file path instead of listing
        const videoRef = ref(storage, 'videos/Snaptik.app_7420530930982423840.mp4');
        console.log('Created reference to specific video');
        
        const url = await getDownloadURL(videoRef);
        console.log('Got video URL:', url);
        
        setVideoUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }
    
    getSingleVideo();
  }, []);
  
  if (loading) return <div className="p-4">Loading video directly...</div>;
  
  if (error) return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Error</h2>
      <div className="bg-red-50 p-3 border border-red-300 rounded">
        {error}
      </div>
    </div>
  );
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Direct Video Test</h1>
      {videoUrl ? (
        <div>
          <video controls className="w-full max-w-md border">
            <source src={videoUrl} type="video/mp4" />
          </video>
          <p className="mt-2 text-sm">Video loaded successfully!</p>
        </div>
      ) : (
        <p>No video found</p>
      )}
    </div>
  );
}
