'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

export default function FirestoreConnectionHelper() {
  const [isOffline, setIsOffline] = useState(false);
  
  // Check connection on mount and window focus
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Try a simple read operation
        await getDocs(collection(db, 'test'));
        setIsOffline(false);
      } catch (err) {
        // If error contains "offline", set offline state
        if (err.message?.includes('offline')) {
          setIsOffline(true);
        }
      }
    };
    
    checkConnection();
    
    // Check connection when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkConnection();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', checkConnection);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', checkConnection);
    };
  }, []);
  
  if (!isOffline) return null;
  
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-red-900/90 text-white p-4 rounded-lg shadow-lg z-50 max-w-md mx-auto">
      <h3 className="font-bold text-lg mb-2">Connection Issue</h3>
      <p className="mb-3">The app is currently offline or having trouble connecting to the database.</p>
      <div className="flex justify-between">
        <button 
          onClick={() => window.location.reload()}
          className="bg-white text-red-900 px-4 py-2 rounded font-medium"
        >
          Try Reconnecting
        </button>
        <Link href="/fix-connection" className="bg-white/20 px-4 py-2 rounded">
          Fix Connection
        </Link>
      </div>
    </div>
  );
}
