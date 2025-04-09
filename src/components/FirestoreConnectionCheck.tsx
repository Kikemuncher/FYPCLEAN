'use client';

import { useEffect, useState } from 'react';
import { checkFirestoreConnectivity } from '@/lib/firebase';

export default function FirestoreConnectionCheck() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await checkFirestoreConnectivity();
        setIsConnected(connected);
      } catch (error) {
        console.error("Connection check error:", error);
        setIsConnected(false);
      } finally {
        setChecking(false);
      }
    };
    
    checkConnection();
  }, []);
  
  if (checking) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-500 p-2 rounded text-sm">
        Checking database connection...
      </div>
    );
  }
  
  if (isConnected === false) {
    return (
      <div className="bg-red-900/30 border border-red-500 p-2 rounded text-sm">
        <p className="font-bold text-red-400">Database connection error</p>
        <p className="text-gray-300 text-xs mt-1">Your app is offline or can't connect to Firebase</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-500/30 hover:bg-red-500/50 text-white text-xs py-1 px-2 rounded"
        >
          Retry Connection
        </button>
      </div>
    );
  }
  
  return null;
}
