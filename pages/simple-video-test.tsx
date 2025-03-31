// pages/simple-video-test.tsx
import { useEffect, useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

export default function SimpleVideoTest() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function getVideos() {
      try {
        const videosRef = ref(storage, 'videos/');
        const result = await listAll(videosRef);
        const urls = await Promise.all(
          result.items.slice(0, 5).map(item => getDownloadURL(item))
        );
        setVideos(urls);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    }
    
    getVideos();
  }, []);
  
  if (loading) return <div>Loading videos...</div>;
  
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Simple Video Test</h1>
      {videos.length > 0 ? (
        <div className="grid gap-4">
          {videos.map((url, i) => (
            <video key={i} controls className="w-full max-w-md">
              <source src={url} />
            </video>
          ))}
        </div>
      ) : (
        <p>No videos found</p>
      )}
    </div>
  );
}
