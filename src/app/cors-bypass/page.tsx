'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SAMPLE_VIDEOS, fetchVideoDirectly } from '@/lib/firebase';

export default function CorsProxyPage() {
  const [videos, setVideos] = useState(SAMPLE_VIDEOS);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [status, setStatus] = useState('Testing direct access...');

  useEffect(() => {
    // Check if CORS proxy is enabled in environment
    const corsProxyEnabled = process.env.NEXT_PUBLIC_USE_CORS_PROXY === 'true';
    setProxyEnabled(corsProxyEnabled);
    
    // Test using direct access
    const testDirectAccess = async () => {
      try {
        // Try to fetch a test video
        const testPath = 'videos/test-video.mp4';
        await fetchVideoDirectly(testPath);
        setStatus('Direct access successful! You can view videos with the proxy.');
      } catch (error) {
        setStatus(`Direct access failed: ${error.message}. Using sample videos instead.`);
      }
    };
    
    testDirectAccess();
  }, []);

  // Change video when user clicks next/prev
  const nextVideo = () => {
    setActiveVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  const prevVideo = () => {
    setActiveVideoIndex((prevIndex) => 
      prevIndex === 0 ? videos.length - 1 : prevIndex - 1
    );
  };

  const currentVideo = videos[activeVideoIndex];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-center">
        <h1 className="text-xl font-bold">⚠️ CORS Bypass Mode</h1>
        <p className="text-sm">
          {proxyEnabled 
            ? "Using CORS proxy to access Firebase Storage" 
            : "Using sample videos due to blocked Firebase access"}
        </p>
      </div>
      
      <div className="p-4 bg-zinc-900/80">
        <div className="max-w-3xl mx-auto">
          <div className="p-3 rounded bg-black/40">
            <h2 className="text-lg font-bold">Access Status</h2>
            <p className="text-gray-300">{status}</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl aspect-video bg-black relative rounded-lg overflow-hidden">
          <video 
            key={currentVideo.url} // Re-create video element when URL changes
            src={currentVideo.url}
            className="w-full h-full object-contain"
            controls
            autoPlay
            playsInline
          />
        </div>
        
        <div className="w-full max-w-3xl mt-4 flex justify-between">
          <button 
            onClick={prevVideo}
            className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded"
          >
            Previous Video
          </button>
          
          <h3 className="text-xl font-bold">{currentVideo.name}</h3>
          
          <button 
            onClick={nextVideo}
            className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded"
          >
            Next Video
          </button>
        </div>
      </div>
      
      <div className="p-6 bg-zinc-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Why This Mode?</h2>
          <p className="mb-4">
            Your network is blocking direct access to Firebase, but allowing access to general Google APIs.
            This mode tries to bypass those restrictions using a CORS proxy.
          </p>
          
          <h3 className="font-bold mt-4 mb-2">Next Steps to Fix the Issue:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Try disabling any content/ad-blockers</li>
            <li>Ask your network administrator to allow access to <code>*.firebaseio.com</code> and <code>*.firebasestorage.googleapis.com</code></li>
            <li>Try connecting through a different network</li>
          </ol>
          
          <div className="mt-6 flex space-x-4">
            <Link href="/" className="text-pink-500 hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
