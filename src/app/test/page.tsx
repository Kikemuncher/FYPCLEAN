'use client';

import { useEffect, useState } from 'react';
import { app } from '@/lib/firebase';

export default function TestPage() {
  const [status, setStatus] = useState("Loading...");
  
  useEffect(() => {
    try {
      // Check if Firebase is initialized
      if (app) {
        setStatus("Firebase initialized successfully!");
      } else {
        setStatus("Firebase not properly initialized");
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Firebase Test Page</h1>
      <div className={`p-4 rounded-lg ${status.includes("Error") ? "bg-red-900/30" : "bg-green-900/30"}`}>
        {status}
      </div>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded"
      >
        Reload
      </button>
    </div>
  );
}
