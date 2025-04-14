"use client";

import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll } from 'firebase/storage';
import Link from 'next/link';

export default function TestConnection() {
  const [status, setStatus] = useState('Testing connection...');
  const [details, setDetails] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function testFirebaseConnection() {
      try {
        setDetails(prev => [...prev, 'Initializing Firebase...']);
        
        // Initialize directly here to isolate from other config issues
        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
        };

        setDetails(prev => [...prev, `Storage bucket: ${firebaseConfig.storageBucket}`]);
        
        const app = initializeApp(firebaseConfig, 'test-instance');
        setDetails(prev => [...prev, 'Firebase initialized']);
        
        const storage = getStorage(app);
        setDetails(prev => [...prev, 'Storage initialized']);
        
        // Try to list root folder
        const rootRef = ref(storage, '/');
        setDetails(prev => [...prev, 'Attempting to access storage root...']);
        
        const result = await listAll(rootRef);
        setDetails(prev => [
          ...prev, 
          `Success! Found ${result.prefixes.length} folders and ${result.items.length} files`
        ]);
        
        // Check if videos folder exists
        if (result.prefixes.some(prefix => prefix.name === 'videos')) {
          setDetails(prev => [...prev, 'Videos folder found!']);
          
          // Try to list videos folder
          const videosRef = ref(storage, 'videos');
          const videosResult = await listAll(videosRef);
          
          setDetails(prev => [
            ...prev, 
            `Found ${videosResult.items.length} videos`
          ]);
          
          setStatus('Connection successful');
        } else {
          setDetails(prev => [...prev, 'Videos folder not found!']);
          setStatus('Connection successful but videos folder missing');
        }
      } catch (err) {
        console.error('Firebase connection test error:', err);
        setError(err);
        setStatus('Connection failed');
        setDetails(prev => [...prev, `Error: ${err.message}`, `Code: ${err.code || 'unknown'}`]);
      }
    }

    testFirebaseConnection();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Firebase Connection Test</h1>
      
      <div className="bg-zinc-900 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            status === 'Testing connection...' ? 'bg-yellow-500' :
            status.includes('successful') ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="font-semibold">{status}</span>
        </div>
        
        <div className="bg-zinc-800 rounded p-4 max-h-80 overflow-y-auto">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap">
            {details.map((detail, i) => (
              <div key={i} className="mb-1">{detail}</div>
            ))}
          </pre>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-lg mb-2">Error Details</h3>
          <div className="bg-black/50 p-3 rounded">
            <p className="text-red-300">Code: {error.code || 'unknown'}</p>
            <p className="text-red-300">Message: {error.message}</p>
            {error.serverResponse && (
              <p className="text-red-300">Server response: {error.serverResponse}</p>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <Link href="/" className="text-pink-500 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
