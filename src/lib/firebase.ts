// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables or direct config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "tiktok-a7af5.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "tiktok-a7af5",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "tiktok-a7af5.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "609721475346",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:609721475346:web:c80084600ed104b6b153cb"
};

// Initialize Firebase
let firebaseApp;
let auth;
let db;
let storage;

// Only initialize on client side
if (typeof window !== 'undefined') {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApps()[0];
  }
  
  // Initialize services
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
}

export { firebaseApp, auth, db, storage };
