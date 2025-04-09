'use client';

import { useState, useEffect } from 'react';
import { db, storage, localData } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ref, listAll } from 'firebase/storage';
import Link from 'next/link';

export default function FirebaseDebugPage() {
  const [browserStatus, setBrowserStatus] = useState('Checking...');
  const [firestoreStatus, setFirestoreStatus] = useState('Checking...');
  const [storageStatus, setStorageStatus] = useState('Checking...');
  const [testResults, setTestResults] = useState<string[]>([]);
  
  useEffect(() => {
    // Check browser connection status
    const checkBrowser = () => {
      const isOnline = navigator.onLine;
      setBrowserStatus(isOnline ? 'Online ✅' : 'Offline ❌');
    };
    
    checkBrowser();
    window.addEventListener('online', checkBrowser);
    window.addEventListener('offline', checkBrowser);
    
    // Add a log entry
    const addLog = (message: string) => {
      setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };
    
    // Test Firestore
    const checkFirestore = async () => {
      try {
        addLog('Testing Firestore...');
        setFirestoreStatus('Testing...');
        const testCol = collection(db, 'test');
        await getDocs(testCol);
        setFirestoreStatus('Connected ✅');
        addLog('Firestore test successful');
      } catch (err) {
        console.error('Firestore check error:', err);
        setFirestoreStatus(`Error: ${err.message} ❌`);
        addLog(`Firestore error: ${err.message}`);
      }
    };
    
    // Test Storage
    const checkStorage = async () => {
      try {
        addLog('Testing Firebase Storage...');
        setStorageStatus('Testing...');
        const rootRef = ref(storage, '');
        await listAll(rootRef);
        setStorageStatus('Connected ✅');
        addLog('Storage test successful');
      } catch (err) {
        console.error('Storage check error:', err);
        setStorageStatus(`Error: ${err.message} ❌`);
        addLog(`Storage error: ${err.message}`);
      }
    };
    
    // Run tests
    checkFirestore();
    checkStorage();
    
    return () => {
      window.removeEventListener('online', checkBrowser);
      window.removeEventListener('offline', checkBrowser);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Firebase Debug Console</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-zinc-900 p-4 rounded-lg">
          <h2 className="font-bold text-lg mb-2">Browser Status</h2>
          <p className={browserStatus.includes('Online') ? 'text-green-500' : 'text-red-500'}>
            {browserStatus}
          </p>
        </div>
        
        <div className="bg-zinc-900 p-4 rounded-lg">
          <h2 className="font-bold text-lg mb-2">Firestore Status</h2>
          <p className={firestoreStatus.includes('Connected') ? 'text-green-500' : 'text-red-500'}>
            {firestoreStatus}
          </p>
          <button 
            onClick={() => window.location.href = '/debug/firebase'} 
            className="mt-2 bg-zinc-800 py-1 px-2 rounded text-sm"
          >
            Retest
          </button>
        </div>
        
        <div className="bg-zinc-900 p-4 rounded-lg">
          <h2 className="font-bold text-lg mb-2">Storage Status</h2>
          <p className={storageStatus.includes('Connected') ? 'text-green-500' : 'text-red-500'}>
            {storageStatus}
          </p>
        </div>
      </div>
      
      <div className="mt-6 bg-zinc-900 p-4 rounded-lg">
        <h2 className="font-bold text-lg mb-2">Demo Videos</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {localData.getVideos().map(video => (
            <div key={video.id} className="bg-zinc-800 p-3 rounded">
              <p className="font-medium">{video.name}</p>
              <p className="text-sm text-gray-400">{video.caption}</p>
              <Link href="/" className="text-pink-500 text-sm">
                View
              </Link>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 bg-zinc-900 p-4 rounded-lg">
        <h2 className="font-bold text-lg mb-2">Test Log</h2>
        <div className="bg-black p-3 rounded h-40 overflow-y-auto font-mono text-sm">
          {testResults.map((log, i) => (
            <div key={i} className="text-gray-400">{log}</div>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        <Link href="/" className="text-pink-500 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
