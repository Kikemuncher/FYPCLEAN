// pages/simple-video-test.tsx
import { useEffect, useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

export default function SimpleVideoTest() {
  // Fixed type annotation for videos state
  const [videos, setVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function getVideos() {
      try {
        console.log('Starting video fetch process');
        const videosRef = ref(storage, 'videos/');
        console.log('Storage reference created:', videosRef.fullPath);
        
        // Add timeout to prevent infinite loading
        const listPromise = listAll(videosRef);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout: Video listing operation took too long')), 10000);
        });
        
        console.log('Fetching video list...');
        const result = await Promise.race([listPromise, timeoutPromise]) as ReturnType<typeof listAll>;
        console.log(`Found ${result.items.length} videos in storage`);
        
        if (result.items.length === 0) {
          setError('No videos found in storage');
          setLoading(false);
          return;
        }
        
        // Limit to 5 videos for testing
        console.log('Retrieving download URLs...');
        const urlPromises = result.items.slice(0, 5).map(async (item) => {
          console.log(`Getting URL for: ${item.fullPath}`);
          try {
            return await getDownloadURL(item);
          } catch (err) {
            console.error(`Failed to get URL for ${item.fullPath}:`, err);
            return null;
          }
        });
        
        const urls = (await Promise.all(urlPromises)).filter(url => url !== null) as string[];
        console.log(`Successfully retrieved ${urls.length} video URLs`);
        setVideos(urls);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setLoading(false);
      }
    }
    
    getVideos();
  }, []);
  
  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
        <p className="text-lg">Loading videos...</p>
        <p className="text-sm text-gray-500 mt-2">Check browser console for progress logs</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Error Loading Videos</h1>
        <div className="bg-red-50 p-4 rounded border border-red-300">
          <p className="text-red-700">{error}</p>
          <p className="text-sm mt-2">Check the console for more details</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Simple Video Test ({videos.length} videos)</h1>
      {videos.length > 0 ? (
        <div className="grid gap-4">
          {videos.map((url, i) => (
            <div key={i} className="border p-3 rounded">
              <p className="mb-2 text-sm font-medium">Video {i+1}</p>
              <video controls className="w-full max-w-md mb-2 border">
                <source src={url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <details>
                <summary className="text-xs text-blue-500 cursor-pointer">Show URL</summary>
                <p className="text-xs break-all mt-1 p-1 bg-gray-50">{url}</p>
              </details>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded border border-yellow-300">
          <p>No videos found to display</p>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 rounded border border-blue-200">
        <h2 className="font-bold mb-2">Debugging Info</h2>
        <p>This test confirms that:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Firebase is properly initialized</li>
          <li>Storage connection is working</li>
          <li>Videos can be listed from storage</li>
          <li>Download URLs can be retrieved</li>
        </ul>
      </div>
    </div>
  );
}
