"use client";

import { ReactNode, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

interface FirebaseProviderProps {
  children: ReactNode;
}

// Regular environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const useEmulator = isDevelopment && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

export default function FirebaseProvider({ children }: FirebaseProviderProps) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Firebase configuration
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      };

      // Initialize Firebase only once
      const app = initializeApp(firebaseConfig);
      
      // Initialize services
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      const storage = getStorage(app);
      
      // Connect to emulators if in development and enabled
      if (useEmulator) {
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(firestore, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('Connected to Firebase emulators');
      }
      
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }, []);

  if (!initialized && typeof window !== 'undefined') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return <>{children}</>;
}
