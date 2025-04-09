'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NetworkStatusChecker() {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);
    
    // Set up listeners for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-600 p-4 text-white text-center">
      <p className="font-bold">You are currently offline</p>
      <p className="text-sm">Some features may not be available until you reconnect</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-2 bg-white text-red-600 px-4 py-1 rounded text-sm font-bold"
      >
        Retry Connection
      </button>
    </div>
  );
}
