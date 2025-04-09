'use client';

import { useState } from 'react';
import { ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import Link from 'next/link';

export default function StorageTestPage() {
  const [results, setResults] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const testStorage = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      setResults("Testing Firebase Storage connection...\n");
      
      // Try to list the root directory
      const rootRef = ref(storage, '');
      const rootList = await listAll(rootRef);
      
      setResults(prev => prev + `✅ Root directory accessible. Found ${rootList.prefixes.length} folders and ${rootList.items.length} files.\n\n`);
      
      // Check if videos folder exists
      const videosRef = ref(storage, 'videos');
      try {
        const videosList = await listAll(videosRef);
        setResults(prev => prev + `✅ Videos folder found. Contains ${videosList.items.length} videos.\n\n`);
        
        // Try to get URLs for a couple videos
        if (videosList.items.length > 0) {
          const firstVideo = videosList.items[0];
          const url = await getDownloadURL(firstVideo);
          const metadata = await getMetadata(firstVideo);
          
          setResults(prev => prev + `✅ Successfully got URL for video: ${firstVideo.name}\n` +
            `Size: ${Math.round(metadata.size / 1024)} KB\n` +
            `Type: ${metadata.contentType}\n` +
            `Full path: ${metadata.fullPath}\n\n`
          );
        }
      } catch (err) {
        setResults(prev => prev + `❌ Error accessing videos folder: ${err.message}\n\n`);
      }
      
      setResults(prev => prev + "Test completed.");
    } catch (err) {
      console.error("Storage test error:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Firebase Storage Test</h1>
      
      <div className="mb-6">
        <button 
          onClick={testStorage} 
          disabled={loading}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Storage Connection'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900/30 border border-red-500 p-4 rounded-lg mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {results && (
        <div className="bg-zinc-900 p-4 rounded-lg mb-6">
          <pre className="whitespace-pre-wrap">{results}</pre>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Troubleshooting</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Check your Firebase Storage rules in the Firebase Console</li>
          <li>Verify that your storage bucket name is correct in .env.local</li>
          <li>Make sure you have uploaded videos to the 'videos' folder</li>
          <li>Check your network connectivity</li>
        </ul>
      </div>
      
      <div className="mt-8">
        <Link href="/" className="text-pink-500 hover:text-pink-400">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
