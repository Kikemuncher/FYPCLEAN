// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Hardcoded Firebase config for when environment variables aren't available
const fallbackConfig = {
  apiKey: "AIzaSyDQYrEqR0XmVqz80gmjJDjOTqE1ejsEDtU",
  authDomain: "tiktok-fyp-clone.firebaseapp.com",
  projectId: "tiktok-fyp-clone",
  storageBucket: "tiktok-fyp-clone.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Use environment variables if available, fall back to hardcoded values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || fallbackConfig.appId
};

// Log Firebase configuration status (safely)
console.log('Firebase config available?', 
  !!firebaseConfig.apiKey && 
  !!firebaseConfig.projectId
);

// Initialize Firebase with proper typing
let firebaseApp: any = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    console.log('Initializing Firebase...');
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    console.log('Firebase already initialized, reusing instance');
    firebaseApp = getApps()[0];
  }
  
  // Initialize Firebase services with explicit types
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  
  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Don't throw - allow the app to continue with degraded functionality
}

export { firebaseApp, auth, db };
