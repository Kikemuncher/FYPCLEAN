import { useEffect, useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

export default function TestFirebase() {
  const [status, setStatus] = useState('Testing connection to Firebase...');
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function testFirebaseConnection() {
      try {
        setStatus('Initializing Firebase connection test...');

        const testRef = ref(storage, 'test');
        setStatus('Firebase Storage reference created successfully');

        const videosRef = ref(storage, 'videos/');
        setStatus('Attempting to list videos folder contents...');

        const result = await listAll(videosRef);
        setStatus(`Found ${result.items.length} items in videos folder`);

        if (result.items.length > 0) {
          const videosList = await Promise.all(
            result.items.map(async (item) => {
              try {
                const url = await getDownloadURL(item);
                return { name: item.name, url };
              } catch (urlError) {
                console.error(`Error getting URL for ${item.name}:`, urlError);
                return { name: item.name, url: `Error: ${urlError.message}` };
              }
            })
          );

          setVideos(videosList);
          setStatus('Firebase connection successful');
        }
      } catch (err) {
        console.error('Firebase test error:', err);
        setError(err.message || 'Unknown error occurred');
        setStatus('Firebase connection test failed');
      }
    }

    testFirebaseConnection();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Firebase Connection Test</h1>

      <div className="bg-gray-100 p-4 rounded-md mb-6">
        <h2 className="text-lg font-semibold mb-2">Status:</h2>
        <p className="text-blue-600">{status}</p>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        )}
      </div>

      {videos.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Found {videos.length} videos:</h2>
          <ul className="space-y-6">
            {videos.map((video, index) => (
              <li key={index} className="border p-4 rounded-md">
                <h3 className="font-bold mb-2">{video.name}</h3>
                <p className="mb-2 text-sm break-all">
                  <span className="font-semibold">URL:</span> {video.url}
                </p>
                {!video.url.startsWith('Error:') && (
                  <video controls width="320" className="mt-2 rounded-md border">
                    <source src={video.url} type="video/mp4" />
                    Your browser does not support video playback
                  </video>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center p-6 bg-yellow-50 rounded-md">
          <p>No videos found in the Firebase Storage 'videos/' folder.</p>
          <p className="mt-2 text-sm">Make sure you've uploaded videos to the correct location.</p>
        </div>
      )}
    </div>
  );
}
