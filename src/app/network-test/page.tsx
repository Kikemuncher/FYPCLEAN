'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, enableNetwork } from 'firebase/firestore';

export default function NetworkTestPage() {
  const [networkStatus, setNetworkStatus] = useState<string>('Checking...');
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [firestoreStatus, setFirestoreStatus] = useState<string>('Checking...');
  
  // Check browser online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      setNetworkStatus(navigator.onLine ? 'Online' : 'Offline');
    };
    
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);
  
  // Check Firestore connectivity
  useEffect(() => {
    const checkFirestore = async () => {
      try {
        setFirestoreStatus('Attempting to connect...');
        
        // Try to enable network
        await enableNetwork(db);
        
        // Try to fetch something
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);
        
        setFirestoreStatus('Connected successfully ✅');
      } catch (error) {
        console.error('Firestore check error:', error);
        setFirestoreStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    checkFirestore();
  }, []);
  
  const forceReconnect = async () => {
    setFirestoreStatus('Attempting to reconnect...');
    
    try {
      // Force reconnection
      await enableNetwork(db);
      setFirestoreStatus('Reconnected successfully ✅');
    } catch (error) {
      setFirestoreStatus(`Reconnection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Network & Firestore Status</h1>
      
      <div className="grid gap-6 max-w-md">
        <div className="bg-zinc-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">Browser Network Status</h2>
          <div className={`text-lg ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
            {networkStatus}
          </div>
        </div>
        
        <div className="bg-zinc-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">Firestore Status</h2>
          <div className={`mb-4 ${firestoreStatus.includes('Error') ? 'text-red-500' : 
                         firestoreStatus.includes('success') ? 'text-green-500' : 'text-yellow-500'}`}>
            {firestoreStatus}
          </div>
          
          <button 
            onClick={forceReconnect}
            className="bg-pink-500 text-white py-2 px-4 rounded hover:bg-pink-600"
          >
            Force Reconnect
          </button>
        </div>
        
        <div className="bg-zinc-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">Troubleshooting</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Check your internet connection</li>
            <li>Verify Firebase project settings</li>
            <li>Make sure Firestore database is created in Firebase Console</li>
            <li>Try reloading the page</li>
            <li>Check browser console for additional errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
