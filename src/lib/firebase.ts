// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Since the env variables may be missing, let's provide a fallback configuration
// You should replace these with your actual Firebase config values if env variables aren't available
const fallbackConfig = {
  apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I", // Replace with your actual Firebase API key
  authDomain: "tiktok-a7af5.firebaseapp.com",
  projectId: "tiktok-a7af5",
  storageBucket: "tiktok-a7af5.firebasestorage.app",
  messagingSenderId: "609721475346",
  appId: "609721475346:web:c80084600ed104b6b153cb"
};

// Try to use env variables first, fall back to hardcoded values if needed
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || fallbackConfig.appId
};

// Log Firebase configuration status
console.log('Firebase config available?', 
  !!firebaseConfig.apiKey && 
  !!firebaseConfig.authDomain && 
  !!firebaseConfig.projectId && 
  !!firebaseConfig.storageBucket &&
  !!firebaseConfig.messagingSenderId &&
  !!firebaseConfig.appId
);

// Additional logging to help debug initialization
console.log('Using API key from:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Environment' : 'Fallback');
console.log('Project ID:', firebaseConfig.projectId);

// Only initialize if not already initialized
let firebaseApp;
let auth;
let db;

try {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    console.log('Initializing Firebase...');
    firebaseApp = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    console.log('Firebase already initialized, reusing instance');
    firebaseApp = getApps()[0];
  }
  
  // Initialize Firebase services
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  
  console.log('Firebase services initialized:', {
    auth: !!auth,
    db: !!db
  });
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Don't throw - allow the app to continue with degraded functionality
}

export { firebaseApp, auth, db };
