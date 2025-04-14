'use client';

import { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import { getStorage, ref, listAll } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Import from our existing firebase setup
import { app as existingApp, db as existingDb, storage as existingStorage, auth as existingAuth } from '@/lib/firebase';

export default function FirebaseDebug() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState({
    projectId: existingApp.options.projectId,
    storageBucket: existingApp.options.storageBucket,
    authDomain: existingApp.options.authDomain
  });
  const [status, setStatus] = useState({
    auth: false,
    firestore: false,
    storage: false
  });

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    console.log(message);
  };

  const runDiagnostics = async () => {
    setLogs([]);
    setIsRunning(true);
    
    addLog('Starting comprehensive Firebase diagnostics...');
    
    // Check existing Firebase app
    addLog('Checking Firebase initialization...');
    if (existingApp) {
      addLog('✅ Firebase app initialized');
    } else {
      addLog('❌ Firebase app not initialized');
    }
    
    // Check config
    addLog('Checking environment variables...');
    if (existingApp.options.apiKey && 
        existingApp.options.projectId && 
        existingApp.options.storageBucket) {
      addLog('✅ All Firebase environment variables are set');
    } else {
      addLog('❌ Missing Firebase environment variables');
    }
    
    // Test Firestore with timeout
    addLog('Testing Firestore connection (5 second timeout)...');
    try {
      // Create a new test instance
      const testFirebaseConfig = { 
        apiKey: existingApp.options.apiKey,
        authDomain: existingApp.options.authDomain,
        projectId: existingApp.options.projectId,
        storageBucket: existingApp.options.storageBucket,
        messagingSenderId: existingApp.options.messagingSenderId,
        appId: existingApp.options.appId
      };
      
      const testApp = initializeApp(testFirebaseConfig, 'diagnostics');
      const testDb = getFirestore(testApp);
      
      // Set a timeout for the test
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Firestore connection timeout')), 5000);
      });
      
      // Try to query Firestore
      const testPromise = async () => {
        const q = query(collection(testDb, 'test-collection'), limit(1));
        return await getDocs(q);
      };
      
      const result = await Promise.race([testPromise(), timeoutPromise]);
      addLog(`✅ Firestore connection successful (${result.size} documents found)`);
      setStatus(prev => ({ ...prev, firestore: true }));
    } catch (error: any) {
      addLog(`❌ Firestore test failed: ${error.message}`);
      addLog('⚠️ Check Firestore rules in Firebase Console');
      setStatus(prev => ({ ...prev, firestore: false }));
    }
    
    // Test Storage with timeout
    addLog('Testing Firebase Storage (5 second timeout)...');
    try {
      // Create a new test instance
      const testApp = initializeApp({
        apiKey: existingApp.options.apiKey,
        authDomain: existingApp.options.authDomain,
        projectId: existingApp.options.projectId,
        storageBucket: existingApp.options.storageBucket,
        messagingSenderId: existingApp.options.messagingSenderId,
        appId: existingApp.options.appId
      }, 'storage-diagnostics');
      
      const testStorage = getStorage(testApp);
      
      // Set a timeout for the test
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Storage connection timeout')), 5000);
      });
      
      // Try to list files in storage
      const testPromise = async () => {
        const rootRef = ref(testStorage, '/');
        return await listAll(rootRef);
      };
      
      await Promise.race([testPromise(), timeoutPromise]);
      addLog('✅ Storage connection successful');
      setStatus(prev => ({ ...prev, storage: true }));
    } catch (error: any) {
      addLog(`❌ Storage test failed: ${error.message}`);
      addLog('⚠️ Check Storage rules in Firebase Console');
      setStatus(prev => ({ ...prev, storage: false }));
    }
    
    // Test Auth
    addLog('Checking Auth service...');
    try {
      const testAuth = getAuth(existingApp);
      if (testAuth) {
        addLog('✅ Auth service initialized');
        setStatus(prev => ({ ...prev, auth: true }));
      } else {
        addLog('❌ Auth service not initialized');
        setStatus(prev => ({ ...prev, auth: false }));
      }
    } catch (error: any) {
      addLog(`❌ Auth test failed: ${error.message}`);
      setStatus(prev => ({ ...prev, auth: false }));
    }
    
    addLog('Diagnostics completed!');
    setIsRunning(false);
  };

  return (
    <div className="bg-zinc-900 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Firebase Diagnostics</h2>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run Diagnostics'}
        </button>
      </div>
      
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center">
            <span>Firestore Status</span>
            <span className={`ml-2 h-3 w-3 rounded-full ${status.firestore ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </h3>
          <p className={status.firestore ? 'text-green-400' : 'text-red-400'}>
            {status.firestore ? 'Connected' : 'Connection Failed'}
          </p>
        </div>
        
        <div className="bg-zinc-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center">
            <span>Storage Status</span>
            <span className={`ml-2 h-3 w-3 rounded-full ${status.storage ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </h3>
          <p className={status.storage ? 'text-green-400' : 'text-red-400'}>
            {status.storage ? 'Connected' : 'Connection Failed'}
          </p>
        </div>
        
        <div className="bg-zinc-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center">
            <span>Auth Status</span>
            <span className={`ml-2 h-3 w-3 rounded-full ${status.auth ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </h3>
          <p className={status.auth ? 'text-green-400' : 'text-red-400'}>
            {status.auth ? 'Initialized' : 'Not Initialized'}
          </p>
        </div>
      </div>
      
      {/* Firebase Config */}
      <div className="bg-zinc-800 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-3">Firebase Configuration</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-gray-400 text-sm">apiKey:</p>
            <p>{existingApp.options.apiKey ? 'Set' : 'Not Set'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">authDomain:</p>
            <p>{existingApp.options.authDomain ? 'Set' : 'Not Set'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">projectId:</p>
            <p>{existingApp.options.projectId ? 'Set' : 'Not Set'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">storageBucket:</p>
            <p>{existingApp.options.storageBucket ? 'Set' : 'Not Set'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">messagingSenderId:</p>
            <p>{existingApp.options.messagingSenderId ? 'Set' : 'Not Set'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">appId:</p>
            <p>{existingApp.options.appId ? 'Set' : 'Not Set'}</p>
          </div>
        </div>
      </div>
      
      {/* Test Results */}
      <div className="bg-zinc-800 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Test Results</h3>
        <div className="font-mono text-sm bg-black p-4 rounded h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">Run diagnostics to see results</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log.includes('❌') ? (
                  <span className="text-red-400">{log}</span>
                ) : log.includes('✅') ? (
                  <span className="text-green-400">{log}</span>
                ) : log.includes('⚠️') ? (
                  <span className="text-yellow-400">{log}</span>
                ) : (
                  <span>{log}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Troubleshooting Guide */}
      <div className="mt-6 bg-zinc-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Troubleshooting</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Make sure your Firebase project is set up correctly</li>
          <li>Verify your Firestore and Storage Rules allow access:
            <pre className="bg-black p-3 rounded-md text-xs mt-2 overflow-x-auto">
              {`// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // For testing only
    }
  }
}`}
            </pre>
            <pre className="bg-black p-3 rounded-md text-xs mt-2 overflow-x-auto">
              {`// Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;  // For testing only
    }
  }
}`}
            </pre>
          </li>
          <li>Check that you have a 'videos' folder in Firebase Storage</li>
          <li>Try clearing browser cache or using incognito mode</li>
        </ul>
        
        <div className="mt-4">
          <a 
            href="/"
            className="inline-block px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded text-white"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
}
