'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import Link from 'next/link';

export default function DebugPage() {
  const [firebaseStatus, setFirebaseStatus] = useState('Checking...');
  const [authStatus, setAuthStatus] = useState('Checking...');
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Check Firebase initialization
    if (auth && db) {
      setFirebaseStatus('Firebase initialized');
      
      // Check auth
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setAuthStatus(user ? 'Logged in' : 'Not logged in');
        setUser(user);
      });
      
      // Check Firestore
      const checkDb = async () => {
        try {
          const q = query(collection(db, 'users'), limit(1));
          const snapshot = await getDocs(q);
          setDbStatus(`Firestore connected (${snapshot.size} users found)`);
        } catch (error) {
          setDbStatus(`Firestore error: ${(error as any).message}`);
        }
      };
      
      checkDb();
      
      return () => unsubscribe();
    } else {
      setFirebaseStatus('Firebase not initialized');
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Firebase Diagnostic Page</h1>
      
      <div className="space-y-6">
        <div className="p-4 bg-zinc-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Firebase Status</h2>
          <p className={firebaseStatus.includes('not') ? 'text-red-500' : 'text-green-500'}>
            {firebaseStatus}
          </p>
        </div>
        
        <div className="p-4 bg-zinc-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
          <p className={authStatus.includes('Not') ? 'text-yellow-500' : 'text-green-500'}>
            {authStatus}
          </p>
          {user && (
            <div className="mt-2">
              <p>User ID: {user.uid}</p>
              <p>Email: {user.email}</p>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-zinc-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Firestore Status</h2>
          <p className={dbStatus.includes('error') ? 'text-red-500' : 'text-green-500'}>
            {dbStatus}
          </p>
        </div>
      </div>
      
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Navigation</h2>
        <div className="flex space-x-4">
          <Link href="/" className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700">
            Home
          </Link>
          <Link href="/auth/login" className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700">
            Login
          </Link>
          <Link href="/auth/signup" className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
