'use client';

import { useState, useEffect } from 'react';
import { app, auth } from '@/lib/firebase';
import Link from 'next/link';

export default function FirebaseTestPage() {
  const [status, setStatus] = useState('Checking Firebase...');

  useEffect(() => {
    // Test Firebase initialization
    if (app && typeof app === 'object' && Object.keys(app).length > 0) {
      setStatus('Firebase app initialized successfully');
    } else {
      setStatus('Firebase app initialization failed');
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Firebase Configuration Test</h1>
      
      <div className="bg-zinc-900 p-6 rounded-lg mb-6">
        <h2 className="font-bold text-xl mb-4">Status</h2>
        <p className={status.includes('failed') ? 'text-red-500' : 'text-green-500'}>
          {status}
        </p>
        
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Actions to take:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Make sure you've created a Firebase project</li>
            <li>Enable Authentication in the Firebase Console</li>
            <li>Add your Firebase config to .env.local file</li>
            <li>Restart your development server after updating .env.local</li>
          </ul>
        </div>
      </div>
      
      <Link href="/diagnostic" className="text-pink-500 hover:text-pink-400">
        Go to Diagnostic Page
      </Link>
    </div>
  );
}
