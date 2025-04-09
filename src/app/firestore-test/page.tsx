'use client';

import { useState } from 'react';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { app, auth, firestore, storage } from '@/lib/firebase';
import Link from 'next/link';

export default function FirestoreTestPage() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [firebaseConfig, setFirebaseConfig] = useState(null);
  const [availableVideos, setAvailableVideos] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({
    firestore: "Not checked",
    storage: "Not checked",
    auth: "Not checked"
  });

  // Run diagnostics with timeout protection
  const runDiagnostics = async () => {
    setLoading(true);
    setTestResults([]);
    addResult("Starting comprehensive Firebase diagnostics...");

    try {
      // Check Firebase initialization
      addResult("Checking Firebase initialization...");
      if (app) {
        addResult("✅ Firebase app initialized");
      } else {
        addResult("❌ Firebase app not initialized");
      }

      // Check environment variables
      addResult("Checking environment variables...");
      const envVars = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Set" : "Missing",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Set" : "Missing",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Set" : "Missing",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "Set" : "Missing",
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "Set" : "Missing",
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "Set" : "Missing"
      };
      setFirebaseConfig(envVars);
      
      const missingVars = Object.entries(envVars).filter(([_, value]) => value === "Missing");
      if (missingVars.length === 0) {
        addResult("✅ All Firebase environment variables are set");
      } else {
        addResult(`❌ Missing environment variables: ${missingVars.map(([key]) => key).join(', ')}`);
      }

      // Test Firestore with timeout
      addResult("Testing Firestore connection (5 second timeout)...");
      try {
        await Promise.race([
          testFirestore(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore connection timeout")), 5000))
        ]);
      } catch (e) {
        addResult(`❌ Firestore test failed: ${e.message}`);
        addResult("⚠️ Check Firestore rules in Firebase Console");
        setConnectionStatus(prev => ({ ...prev, firestore: "Connection Failed" }));
      }

      // Test Storage with timeout
      addResult("Testing Firebase Storage (5 second timeout)...");
      try {
        await Promise.race([
          testStorage(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Storage connection timeout")), 5000))
        ]);
      } catch (e) {
        addResult(`❌ Storage test failed: ${e.message}`);
        addResult("⚠️ Check Storage rules in Firebase Console");
        setConnectionStatus(prev => ({ ...prev, storage: "Connection Failed" }));
      }

      // Test Auth
      addResult("Checking Auth service...");
      if (auth) {
        addResult("✅ Auth service initialized");
        setConnectionStatus(prev => ({ ...prev, auth: "Initialized" }));
      } else {
        addResult("❌ Auth service not initialized");
        setConnectionStatus(prev => ({ ...prev, auth: "Not initialized" }));
      }
      
      addResult("Diagnostics completed!");
    } catch (error) {
      addResult(`❌ Error during diagnostics: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test Firestore connection
  const testFirestore = async () => {
    try {
      // Try to set a document with a known ID first (more reliable than addDoc)
      const testDocRef = doc(firestore, 'test', 'test-connection');
      await setDoc(testDocRef, { 
        testField: 'test value',
        timestamp: new Date().toISOString()
      });
      addResult(`✅ Successfully wrote to Firestore document 'test/test-connection'`);
      
      // Now try to read it back
      const testRef = collection(firestore, 'test');
      const snapshot = await getDocs(testRef);
      addResult(`✅ Successfully read from Firestore: found ${snapshot.size} documents`);
      
      setConnectionStatus(prev => ({ ...prev, firestore: "Connected" }));
      return true;
    } catch (e) {
      throw e;
    }
  };

  // Test Storage connection
  const testStorage = async () => {
    try {
      const storageRef = ref(storage, '/');
      await listAll(storageRef);
      addResult("✅ Successfully connected to Firebase Storage");
      
      // Try to list videos
      const videosRef = ref(storage, 'videos');
      try {
        const videosList = await listAll(videosRef);
        
        if (videosList.items.length === 0) {
          addResult("⚠️ No videos found in 'videos' folder");
        } else {
          addResult(`✅ Found ${videosList.items.length} videos in storage`);
          
          // Get details of first 3 videos
          const videosData = [];
          for (let i = 0; i < Math.min(3, videosList.items.length); i++) {
            const item = videosList.items[i];
            try {
              const url = await getDownloadURL(item);
              videosData.push({ name: item.name, url });
            } catch (e) {
              videosData.push({ name: item.name, error: e.message });
            }
          }
          setAvailableVideos(videosData);
        }
      } catch (e) {
        addResult(`❌ Error listing videos: ${e.message}`);
      }
      
      setConnectionStatus(prev => ({ ...prev, storage: "Connected" }));
      return true;
    } catch (e) {
      throw e;
    }
  };

  const addResult = (message) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Firebase Diagnostics</h1>

      <div className="mb-6">
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run Diagnostics'}
        </button>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-900 p-4 rounded-lg">
          <h2 className="font-bold mb-2">Firestore Status</h2>
          <div className={
            connectionStatus.firestore === "Connected" ? "text-green-500" :
            connectionStatus.firestore === "Connection Failed" ? "text-red-500" : "text-yellow-500"
          }>
            {connectionStatus.firestore}
          </div>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg">
          <h2 className="font-bold mb-2">Storage Status</h2>
          <div className={
            connectionStatus.storage === "Connected" ? "text-green-500" :
            connectionStatus.storage === "Connection Failed" ? "text-red-500" : "text-yellow-500"
          }>
            {connectionStatus.storage}
          </div>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg">
          <h2 className="font-bold mb-2">Auth Status</h2>
          <div className={
            connectionStatus.auth === "Initialized" ? "text-green-500" : "text-yellow-500"
          }>
            {connectionStatus.auth}
          </div>
        </div>
      </div>

      {/* Config Info */}
      {firebaseConfig && (
        <div className="bg-zinc-900 p-4 rounded-lg mb-6">
          <h2 className="font-bold mb-2">Firebase Configuration</h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(firebaseConfig).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400">{key}:</span>
                <span className={value === "Set" ? "text-green-500" : "text-red-500"}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Videos */}
      {availableVideos && availableVideos.length > 0 && (
        <div className="bg-zinc-900 p-4 rounded-lg mb-6">
          <h2 className="font-bold mb-4">Available Videos</h2>
          <div className="space-y-4">
            {availableVideos.map((video, index) => (
              <div key={index} className="bg-zinc-800 p-3 rounded">
                <p className="font-medium">{video.name}</p>
                {video.error ? (
                  <p className="text-red-400 text-sm">{video.error}</p>
                ) : (
                  <div className="mt-2">
                    <video 
                      src={video.url}
                      controls 
                      className="max-h-40 rounded"
                      preload="metadata"
                    ></video>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Results */}
      <div className="bg-zinc-900 p-4 rounded-lg mb-6">
        <h2 className="font-bold mb-2">Test Results</h2>
        <div className="bg-black p-4 rounded h-60 overflow-y-auto font-mono text-sm">
          {testResults.length > 0 ? (
            testResults.map((result, i) => (
              <div key={i} className={
                result.includes("✅") ? "text-green-500" :
                result.includes("❌") ? "text-red-500" :
                result.includes("⚠️") ? "text-yellow-500" : "text-gray-300"
              }>
                {result}
              </div>
            ))
          ) : (
            <p className="text-gray-500">Click "Run Diagnostics" to start testing</p>
          )}
        </div>
      </div>

      {/* Troubleshooting Section */}
      <div className="bg-zinc-900 p-4 rounded-lg mb-6">
        <h2 className="font-bold mb-2">Troubleshooting</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Make sure your Firebase project is set up correctly</li>
          <li>Verify your Firestore and Storage Rules allow access:</li>
          <pre className="mt-1 mb-2 p-2 bg-black rounded text-xs overflow-auto">
{`// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // For testing only
    }
  }
}

// Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;  // For testing only
    }
  }
}`}
          </pre>
          <li>Check that you have a 'videos' folder in Firebase Storage</li>
          <li>Try clearing browser cache or using incognito mode</li>
        </ul>
      </div>

      <div className="mt-8">
        <Link href="/" className="text-pink-500 hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
