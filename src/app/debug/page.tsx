'use client';

import { useState, useEffect } from 'react';
import { app, auth, db, storage } from '@/lib/firebase';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { collection, getDocs, limit } from 'firebase/firestore';
import Link from 'next/link';

export default function DebugPage() {
  const [appStatus, setAppStatus] = useState('Checking...');
  const [authStatus, setAuthStatus] = useState('Checking...');
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [storageStatus, setStorageStatus] = useState('Checking...');
  const [error, setError] = useState<string | null>(null);
  
  // Test Firebase App initialization
  useEffect(() => {
    try {
      if (app) {
        setAppStatus('Firebase app initialized ✅');
      } else {
        setAppStatus('Firebase app not initialized ❌');
      }
    } catch (err) {
      setAppStatus(`Error checking Firebase app: ${err.message}`);
    }
  }, []);
  
  // Test Firebase Auth
  useEffect(() => {
    try {
      if (auth) {
        setAuthStatus('Firebase Auth initialized ✅');
      } else {
        setAuthStatus('Firebase Auth not initialized ❌');
      }
    } catch (err) {
      setAuthStatus(`Error checking Firebase auth: ${err.message}`);
    }
  }, []);
  
  // Test Firestore
  useEffect(() => {
    const checkFirestore = async () => {
      try {
        if (!db) {
          setDbStatus('Firestore not initialized ❌');
          return;
        }
        
        // Try to perform a simple query
        const querySnapshot = await getDocs(collection(db, 'users'));
        setDbStatus(`Firestore working ✅ (${querySnapshot.size} users found)`);
      } catch (err) {
        console.error('Firestore test error:', err);
        setDbStatus(`Firestore error: ${err.code || err.message} ❌`);
      }
    };
    
    checkFirestore();
  }, []);
  
  // Test Firebase Storage specifically
  useEffect(() => {
    const checkStorage = async () => {
      try {
        if (!storage) {
          setStorageStatus('Firebase Storage not initialized ❌');
          return;
        }
        
        setStorageStatus('Trying to access Firebase Storage...');
        
        // First try to list root items
        try {
          const rootRef = ref(storage, '/');
          const listResult = await listAll(rootRef);
          setStorageStatus(`Storage list successful ✅ (${listResult.items.length} root items)`);
        } catch (listError) {
          console.error('Storage list error:', listError);
          setStorageStatus(`Storage list error: ${listError.code || listError.message} ❌`);
          setError(JSON.stringify(listError, null, 2));
        }
      } catch (err) {
        console.error('Storage initialization error:', err);
        setStorageStatus(`Storage initialization error: ${err.message} ❌`);
        setError(JSON.stringify(err, null, 2));
      }
    };
    
    checkStorage();
  }, []);
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Firebase Debug Page</h1>
      
      <div className="space-y-6 max-w-2xl">
        <div className="p-4 bg-zinc-900 rounded">
          <h2 className="text-xl mb-2">Environment Variables</h2>
          <div className="bg-black p-3 rounded text-sm">
            <p>STORAGE_BUCKET: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'Not set'}</p>
            <p>PROJECT_ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}</p>
          </div>
        </div>
        
        <div className="p-4 bg-zinc-900 rounded">
          <h2 className="text-xl mb-2">Firebase App</h2>
          <p className={appStatus.includes('✅') ? 'text-green-400' : 'text-red-400'}>
            {appStatus}
          </p>
        </div>
        
        <div className="p-4 bg-zinc-900 rounded">
          <h2 className="text-xl mb-2">Firebase Auth</h2>
          <p className={authStatus.includes('✅') ? 'text-green-400' : 'text-red-400'}>
            {authStatus}
          </p>
        </div>
        
        <div className="p-4 bg-zinc-900 rounded">
          <h2 className="text-xl mb-2">Firestore Database</h2>
          <p className={dbStatus.includes('✅') ? 'text-green-400' : 'text-red-400'}>
            {dbStatus}
          </p>
        </div>
        
        <div className="p-4 bg-zinc-900 rounded">
          <h2 className="text-xl mb-2">Firebase Storage</h2>
          <p className={storageStatus.includes('✅') ? 'text-green-400' : 'text-red-400'}>
            {storageStatus}
          </p>
          
          {error && (
            <div className="mt-4 bg-red-900/30 p-3 rounded">
              <p className="font-bold mb-1">Error details:</p>
              <pre className="overflow-auto max-h-40 text-xs">
                {error}
              </pre>
            </div>
          )}
          
          <div className="mt-4 bg-yellow-900/30 p-3 rounded">
            <p className="font-bold mb-1">Storage troubleshooting:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Check that your Storage bucket format is correct (should be <b>projectid.appspot.com</b>)</li>
              <li>Verify that your Storage rules allow reading from the videos folder</li>
              <li>Make sure you've created the 'videos' folder in Firebase Storage</li>
              <li>Try uploading a test file directly in the Firebase Console</li>
            </ol>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button onClick={() => window.location.reload()} className="bg-pink-500 text-white px-4 py-2 rounded">
            Refresh Tests
          </button>
          <Link href="/" className="bg-zinc-700 text-white px-4 py-2 rounded">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
