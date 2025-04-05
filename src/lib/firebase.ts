// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const USE_LOCAL_AUTH = true; // Toggle this to switch between Firebase and local auth

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "tiktok-a7af5.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "tiktok-a7af5",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "tiktok-a7af5.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "609721475346",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:609721475346:web:c80084600ed104b6b153cb"
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Only initialize on client side and if not using local auth
if (typeof window !== 'undefined' && !USE_LOCAL_AUTH) {
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

// Add mock implementations for local mode
if (USE_LOCAL_AUTH) {
  // Provide mock implementations or wrappers around local storage
  auth = {} as Auth; // Mock Auth object
  db = {} as Firestore; // Mock Firestore object
  storage = {} as FirebaseStorage; // Mock Storage object

  // You can add more detailed mocks if needed, for example:
  // auth = {
  //   createUserWithEmailAndPassword: async () => { /* ...mock logic... */ },
  //   signInWithEmailAndPassword: async () => { /* ...mock logic... */ },
  //   // ...other auth methods...
  // } as Auth;
  // db = {
  //   collection: () => { /* ...mock logic... */ },
  //   doc: () => { /* ...mock logic... */ },
  //   // ...other firestore methods...
  // } as Firestore;
  // storage = {
  //   ref: () => { /* ...mock logic... */ },
  //   // ...other storage methods...
  // } as FirebaseStorage;
}

export { firebaseApp, auth, db, storage };
