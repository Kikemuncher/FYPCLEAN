// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Corrected Firebase config 
const firebaseConfig = {
  apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
  authDomain: "tiktok-a7af5.firebaseapp.com",
  projectId: "tiktok-a7af5",
  storageBucket: "tiktok-a7af5.appspot.com", // Corrected this value
  messagingSenderId: "609721475346",
  appId: "1:609721475346:web:c80084600ed104b6b153cb",
  measurementId: "G-3Z96CKXW1W"
};

console.log('Firebase config loaded');

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
  
  // Initialize Firebase services
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  
  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { firebaseApp, auth, db };
