// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration with hardcoded values
const firebaseConfig = {
  apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
  authDomain: "tiktok-a7af5.firebaseapp.com",
  projectId: "tiktok-a7af5",
  storageBucket: "tiktok-a7af5.firebasestorage.app", 
  messagingSenderId: "609721475346",
  appId: "1:609721475346:web:c80084600ed104b6b153cb"
};

// Dummy implementations for SSR
class DummyAuth {}
class DummyFirestore {}
class DummyStorage {}
class DummyApp {}

// Initialize Firebase
let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Only initialize on client side
if (typeof window !== 'undefined') {
  try {
    // Check if Firebase is already initialized
    if (!getApps().length) {
      console.log('Initializing Firebase...');
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      console.log('Firebase already initialized');
      firebaseApp = getApps()[0];
    }
    
    // Initialize services
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
    
    console.log('Firebase services initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    // Create dummy instances
    firebaseApp = new DummyApp() as unknown as FirebaseApp;
    auth = new DummyAuth() as unknown as Auth;
    db = new DummyFirestore() as unknown as Firestore;
    storage = new DummyStorage() as unknown as FirebaseStorage;
  }
} else {
  // Create dummy instances for server-side
  firebaseApp = new DummyApp() as unknown as FirebaseApp;
  auth = new DummyAuth() as unknown as Auth;
  db = new DummyFirestore() as unknown as Firestore;
  storage = new DummyStorage() as unknown as FirebaseStorage;
}

export { firebaseApp, auth, db, storage };
