// pages/firebase-explicit-test.tsx
import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

export default function FirebaseExplicitTest() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  useEffect(() => {
    async function testDirectVideo() {
      try {
        addLog('Starting explicit Firebase initialization test');
        
        // These should match your Firebase config in src/lib/firebase.ts
        const firebaseConfig = {
          apiKey: "AIzaSyC_r_pyvnVRxoHEdjk9jcFLVa_yuR1I",
          authDomain: "tiktok-fyp-clone.firebaseapp.com",
          projectId: "tiktok-fyp-clone",
          storageBucket: "tiktok-fyp-clone.appspot.com",
          messagingSenderId: "376694943664",
          appId: "1:376694943664:web:0172e4f5d73f45db91f9d9"
        };
        
        // Initialize Firebase explicitly
        const app = initializeApp(firebaseConfig, 'explicit-test');
        addLog('Firebase initialized with explicit config');
        
        // Get storage reference
        const storage = getStorage(app);
        addLog('Got Storage reference');
        
        // Try to access a specific video directly
        const videoRef = ref(storage, 'videos/Snaptik.app_7420530930982423840.mp4');
        addLog(`Created reference to specific video: ${videoRef.fullPath}`);
        
        // Add timeout protection
        const urlPromise = getDownloadURL(videoRef);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Download URL request timed out after 15 seconds')), 15000);
        });
        
        addLog('Requesting download URL (with 15s timeout)...');
        const url = await Promise.race([urlPromise, timeoutPromise]) as string;
        
        addLog(`Success! Got video URL: ${url.substring(0, 30)}...`);
        setVideoUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        addLog(`Error: ${err instanceof Error ? err.message : String(err)}`);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }
    
    testDirectVideo();
  }, []);
  
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Firebase Explicit Initialization Test</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">Status: {loading ? 'Testing...' : (error ? 'Error' : 'Success')}</h2>
        {loading && <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>}
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded border border-red-300 mb-6">
          <h2 className="text-lg font-semibold text-red-700">Error</h2>
          <p className="mt-2">{error}</p>
        </div>
      )}
      
      {videoUrl && (
        <div className="mb-6 border p-3 rounded">
          <h2 className="font-semibold mb-2">Video Test</h2>
          <video controls className="w-full border">
            <source src={videoUrl} type="video/mp4" />
            Your browser doesn't support video playback.
          </video>
        </div>
      )}
      
      <div className="border rounded-lg overflow-hidden mb-6">
        <div className="bg-gray-800 text-white px-4 py-2 font-mono text-sm">
          Test Logs
        </div>
        <div className="bg-black text-green-400 p-4 font-mono text-xs overflow-auto h-60">
          {logs.map((log, i) => (
            <div key={i} className="mb-1">
              {log.startsWith('Error:') ? (
                <span className="text-red-500">{log}</span>
              ) : log.startsWith('Success!') ? (
                <span className="text-blue-500 font-bold">{log}</span>
              ) : (
                log
              )}
            </div>
          ))}
          {loading && <div className="animate-pulse">_</div>}
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded border border-blue-200">
        <h2 className="font-semibold mb-2">About This Test</h2>
        <p className="mb-2">This test explicitly initializes Firebase with hardcoded config instead of relying on your existing setup.</p>
        <p>If this test works but your app doesn't, the issue is likely with how Firebase is initialized in your main application.</p>
      </div>
    </div>
  );
}
