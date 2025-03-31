'use client';

import { useState, useEffect } from 'react';
import { ref, listAll, getDownloadURL, getStorage } from 'firebase/storage';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { FirebaseOptions } from 'firebase/app';

// Direct Firebase validation component - doesn't rely on existing config
const FirebaseStorageDebugger = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState({
    initialized: false,
    storageAccess: false,
    listOperation: false,
    downloadUrls: false
  });
  
  // Fixed type definition for firebaseConfig
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseOptions | null>(null);

  useEffect(() => {
    // First check if we can access the Firebase config
    try {
      // Try to get the existing app or create a new one for testing
      let app;
      if (getApps().length > 0) {
        app = getApp();
        console.log('Found existing Firebase app:', app.options);
        setFirebaseConfig(app.options);
        setConnectionStatus(prev => ({...prev, initialized: true}));
      } else {
        console.error('No Firebase app initialized');
        setError('Firebase app not initialized. Check firebase.ts file.');
        setLoading(false);
        return;
      }

      // Direct approach - get storage reference
      try {
        const storage = getStorage(app);
        console.log('Storage reference acquired:', storage);
        setConnectionStatus(prev => ({...prev, storageAccess: true}));
        
        // Attempt to list videos
        const fetchVideos = async () => {
          try {
            const videosRef = ref(storage, 'videos/');
            console.log('Created video reference for path:', videosRef.fullPath);
            
            // Add timeout to prevent infinite waiting
            const listPromise = listAll(videosRef);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Firebase listAll operation timed out after 10 seconds')), 10000)
            );
            
            const result = await Promise.race([listPromise, timeoutPromise]);
            console.log('Successfully listed videos:', result);
            setConnectionStatus(prev => ({...prev, listOperation: true}));
            
            if (result.items.length === 0) {
              console.log('No videos found in the videos/ directory');
              setLoading(false);
              return;
            }
            
            // Get download URLs with individual try/catch blocks
            const urls: {path: string, url?: string, error?: string}[] = [];
            for (const item of result.items) {
              try {
                console.log('Requesting URL for:', item.fullPath);
                const url = await getDownloadURL(item);
                console.log('Got URL:', url);
                urls.push({path: item.fullPath, url});
              } catch (urlErr) {
                console.error(`Failed to get URL for ${item.fullPath}:`, urlErr);
                urls.push({path: item.fullPath, error: (urlErr as Error).message});
              }
            }
            
            console.log('Final video data:', urls);
            setVideos(urls);
            setConnectionStatus(prev => ({...prev, downloadUrls: urls.some(item => item.url)}));
            setLoading(false);
          } catch (err) {
            console.error('Error during video listing:', err);
            setError(`Firebase listing error: ${(err as Error).message}`);
            setLoading(false);
          }
        };
        
        fetchVideos();
      } catch (storageErr) {
        console.error('Failed to get storage reference:', storageErr);
        setError(`Firebase storage access error: ${(storageErr as Error).message}`);
        setLoading(false);
      }
    } catch (appErr) {
      console.error('Error accessing Firebase app:', appErr);
      setError(`Firebase initialization error: ${(appErr as Error).message}`);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Firebase Connection Diagnostic</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <p className="text-blue-600 font-medium">Testing Firebase connection...</p>
          <ul className="space-y-2 text-sm">
            <li>✓ Running diagnostic checks</li>
            <li>{connectionStatus.initialized ? '✓' : '⏳'} Firebase initialization</li>
            <li>{connectionStatus.storageAccess ? '✓' : '⏳'} Storage access</li>
            <li>{connectionStatus.listOperation ? '✓' : '⏳'} Listing videos</li>
            <li>{connectionStatus.downloadUrls ? '✓' : '⏳'} Getting download URLs</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Firebase Connection Diagnostic Results</h1>
      
      {error ? (
        <div className="bg-red-50 p-4 rounded border border-red-300 mb-6">
          <h2 className="text-lg font-semibold text-red-700">Error Detected</h2>
          <p className="mt-2">{error}</p>
        </div>
      ) : null}
      
      <div className="mb-6 bg-gray-50 p-4 rounded border">
        <h2 className="font-semibold mb-2">Firebase Configuration</h2>
        {firebaseConfig ? (
          <div>
            <p><span className="font-medium">Project ID:</span> {firebaseConfig.projectId}</p>
            <p><span className="font-medium">Storage Bucket:</span> {firebaseConfig.storageBucket}</p>
            <p className="mt-2 text-sm text-green-600">✓ Firebase configuration is valid</p>
          </div>
        ) : (
          <p className="text-red-600">Could not retrieve Firebase configuration</p>
        )}
      </div>
      
      <div className="mb-6 bg-gray-50 p-4 rounded border">
        <h2 className="font-semibold mb-2">Connection Status</h2>
        <ul className="space-y-1">
          <li className={connectionStatus.initialized ? "text-green-600" : "text-red-600"}>
            {connectionStatus.initialized ? "✓" : "✗"} Firebase initialized
          </li>
          <li className={connectionStatus.storageAccess ? "text-green-600" : "text-red-600"}>
            {connectionStatus.storageAccess ? "✓" : "✗"} Storage reference created
          </li>
          <li className={connectionStatus.listOperation ? "text-green-600" : "text-red-600"}>
            {connectionStatus.listOperation ? "✓" : "✗"} Video listing operation
          </li>
          <li className={connectionStatus.downloadUrls ? "text-green-600" : "text-red-600"}>
            {connectionStatus.downloadUrls ? "✓" : "✗"} Download URL generation
          </li>
        </ul>
      </div>
      
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Videos Check</h2>
        {videos.length === 0 ? (
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <p>No videos found in 'videos/' directory</p>
            <p className="mt-2 text-sm">Possible causes:</p>
            <ul className="list-disc ml-5 mt-1 text-sm">
              <li>Directory is empty</li>
              <li>Path is incorrect (case-sensitive)</li>
              <li>Storage rules are blocking access</li>
              <li>Authentication required but not provided</li>
            </ul>
          </div>
        ) : (
          <div>
            <p className="mb-2">Found {videos.length} videos:</p>
            <div className="space-y-4">
              {videos.map((video, index) => (
                <div key={index} className="border rounded p-3">
                  <p className="font-medium">{video.path}</p>
                  {video.url ? (
                    <div className="mt-2">
                      <video 
                        controls 
                        className="w-full h-auto mt-2 border"
                        src={video.url}
                      >
                        Your browser does not support the video tag.
                      </video>
                      <p className="text-sm mt-1 break-all">{video.url}</p>
                    </div>
                  ) : (
                    <p className="text-red-600 mt-1">Error: {video.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 p-4 rounded border border-blue-200">
        <h2 className="font-semibold">Next Debugging Steps</h2>
        <ul className="list-disc ml-5 mt-2">
          <li>Check Firebase Storage Rules in Firebase Console</li>
          <li>Verify the video files were uploaded correctly</li>
          <li>Check browser console for detailed error logs</li>
          <li>Confirm network requests in Network tab (Dev Tools)</li>
          <li>Try uploading a test video with this fix to verify write access</li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseStorageDebugger;
