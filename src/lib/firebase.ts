// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// MANUALLY set Firebase config to ensure no environment variable issues
const firebaseConfig = {
  apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
  authDomain: "tiktok-a7af5.firebaseapp.com",
  projectId: "tiktok-a7af5",
  storageBucket: "tiktok-a7af5.firebasestorage.app",
  messagingSenderId: "609721475346",
  appId: "1:609721475346:web:c80084600ed104b6b153cb",
  measurementId: "G-3Z96CKXW1W"
};

// Note: This project is using Node.js v22.14.0, which is a very recent version.
// Firebase SDK is compatible with this version, but keep in mind that you may 
// want to check for Node.js updates periodically using: npm view node version

// Validate the Firebase configuration
const validateFirebaseConfig = (config: Record<string, string>) => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Firebase config is missing required fields: ${missingFields.join(', ')}`);
  }
};

// Initialize Firebase with safeguards
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let firebaseInitialized = false;

try {
  // Validate config before initialization
  validateFirebaseConfig(firebaseConfig);
  
  // Check if Firebase is already initialized to prevent duplicate apps
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  firebaseInitialized = true;
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Create safe fallbacks so the app doesn't crash entirely
  // The services will be non-functional but at least won't throw errors when imported
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
}

// Export both the services and initialization status
export { app, auth, db, storage, firebaseInitialized };

// Utility function to check Firebase connection status
export const checkFirebaseConnection = async (): Promise<boolean> => {
  if (!firebaseInitialized) return false;
  
  try {
    // Simple test to check Firestore connection
    await db.terminate();
    await db.enableNetwork();
    return true;
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return false;
  }
};
