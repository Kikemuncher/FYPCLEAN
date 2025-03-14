// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Exact same configuration as your working project
const firebaseConfig = {
  apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
  authDomain: "tiktok-a7af5.firebaseapp.com",
  projectId: "tiktok-a7af5",
  storageBucket: "tiktok-a7af5.appspot.com",
  messagingSenderId: "609721475346",
  appId: "1:609721475346:web:c80084600ed104b6b153cb",
  measurementId: "G-3Z96CKXW1W"
};

// Initialize Firebase the same way as your working project
let firebaseApp: any = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  if (!getApps().length) {
    console.log('Initializing Firebase...');
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    console.log('Firebase already initialized');
    firebaseApp = getApps()[0];
  }
  
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  
  console.log('Firebase services initialized');
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

export { firebaseApp, auth, db };
