'use client';

import { useState } from 'react';
import { db, resetConnection } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

export default function FixConnectionPage() {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const checkConnection = async () => {
    setIsLoading(true);
    setStatus('Checking Firestore connection...');
    
    try {
      // Try to fetch data from a test collection
      const testCol = collection(db, 'test');
      await getDocs(testCol);
      
      setStatus('✅ Connection successful! Firestore is working.');
    } catch (error) {
      console.error('Connection check error:', error);
      setStatus(`❌ Connection error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetFirestoreConnection = async () => {
    setIsLoading(true);
    setStatus('Resetting Firestore connection...');
    
    try {
      const result = await resetConnection();
      
      if (result) {
        setStatus('✅ Connection reset successful. Testing connection...');
        // Test if it worked
        await checkConnection();
      } else {
        setStatus('❌ Failed to reset connection');
      }
    } catch (error) {
      console.error('Reset error:', error);
      setStatus(`❌ Error during reset: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-8">Fix Firestore Connection</h1>
        
        <div className="bg-zinc-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Firestore Connection Issue</h2>
          <p className="text-gray-300 mb-4">
            If you're seeing a "client is offline" error, this utility can help fix the Firestore connection.
          </p>
          
          <div className="flex flex-col space-y-4">
            <button 
              onClick={checkConnection}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              Check Connection
            </button>
            
            <button
              onClick={resetFirestoreConnection}
              disabled={isLoading}
              className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              Reset Connection
            </button>
          </div>
        </div>
        
        {status && (
          <div className={`p-4 rounded-lg mb-6 ${
            status.includes('✅') ? 'bg-green-900/30 border border-green-600' : 
            status.includes('❌') ? 'bg-red-900/30 border border-red-600' : 
            'bg-blue-900/30 border border-blue-600'
          }`}>
            <p className="text-sm">{status}</p>
          </div>
        )}
        
        <div className="bg-zinc-900 rounded-lg p-6 mb-6">
          <h3 className="font-bold mb-2">Troubleshooting Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
            <li>Try clicking "Reset Connection" above</li>
            <li>Check your internet connection</li>
            <li>Verify your Firebase project is active</li>
            <li>Ensure your Firebase rules allow read/write</li>
            <li>Try clearing your browser cache or using incognito mode</li>
          </ol>
        </div>
        
        <div className="mt-8">
          <Link href="/" className="text-pink-500 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
