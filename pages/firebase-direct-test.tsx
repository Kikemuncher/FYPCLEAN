// pages/firebase-direct-test.tsx
import { useEffect, useState } from 'react';
import Head from 'next/head';

// This component bypasses your existing firebase.ts file
// and sets up a direct connection to Firebase
const FirebaseDirectTest = () => {
  const [status, setStatus] = useState('Initializing test...');
  const [logs, setLogs] = useState<string[]>([]);
  const [testComplete, setTestComplete] = useState(false);
  
  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  useEffect(() => {
    const runTest = async () => {
      try {
        // 1. First try to dynamically import Firebase packages
        addLog('Step 1: Loading Firebase packages...');
        
        let firebase;
        try {
          const { initializeApp, getApps } = await import('firebase/app');
          const { getStorage, ref, listAll, getDownloadURL } = await import('firebase/storage');
          
          firebase = { 
            initializeApp, 
            getApps,
            getStorage,
            ref,
            listAll,
            getDownloadURL
          };
          
          addLog('✅ Firebase packages loaded successfully');
        } catch (importError) {
          addLog(`❌ Failed to import Firebase: ${(importError as Error).message}`);
          setStatus('Error: Failed to load Firebase packages');
          setTestComplete(true);
          return;
        }
        
        // 2. Check your environment variables
        addLog('Step 2: Checking for Firebase configuration...');
        
        // Try multiple approaches to find your Firebase config
        const envVars = [
          // Standard Firebase env vars
          'NEXT_PUBLIC_FIREBASE_API_KEY',
          'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
          'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
          'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
          'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
          'NEXT_PUBLIC_FIREBASE_APP_ID',
          
          // Alternative naming patterns
          'FIREBASE_API_KEY',
          'REACT_APP_FIREBASE_API_KEY',
          'FIREBASE_CONFIG'
        ];
        
        const foundEnvVars = envVars.filter(key => 
          typeof process.env[key] !== 'undefined' && process.env[key] !== ''
        );
        
        if (foundEnvVars.length > 0) {
          addLog(`✅ Found ${foundEnvVars.length} Firebase-related environment variables`);
          foundEnvVars.forEach(key => addLog(`   - ${key} is defined`));
        } else {
          addLog('⚠️ No Firebase environment variables found');
        }
        
        // 3. Check for existing Firebase instance
        addLog('Step 3: Checking for existing Firebase app...');
        let firebaseApp;
        
        if (firebase.getApps().length > 0) {
          addLog('✅ Found existing Firebase app');
          firebaseApp = firebase.getApps()[0];
        } else {
          addLog('⚠️ No existing Firebase app found');
          
          // 4. Try to create a Firebase app with hard-coded config for testing
          addLog('Step 4: Attempting to initialize Firebase directly...');
          
          try {
            // IMPORTANT: Replace with your actual Firebase config from the Firebase console
            // This is just for testing - you should move this to env vars in production
            const firebaseConfig = {
              apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
              authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
              storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
              messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
              appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID"
            };
            
            // If using env vars, print partial key to verify
            if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
              const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
              const firstChars = apiKey.substring(0, 4);
              const lastChars = apiKey.substring(apiKey.length - 4);
              addLog(`   - Using API key: ${firstChars}...${lastChars}`);
            }
            
            firebaseApp = firebase.initializeApp(firebaseConfig);
            addLog('✅ Firebase initialized successfully');
          } catch (initError) {
            addLog(`❌ Failed to initialize Firebase: ${(initError as Error).message}`);
            setStatus('Error: Failed to initialize Firebase');
            setTestComplete(true);
            return;
          }
        }
        
        // 5. Test Storage connection
        addLog('Step 5: Testing Firebase Storage connection...');
        try {
          const storage = firebase.getStorage(firebaseApp);
          addLog('✅ Storage connection successful');
          
          // 6. Try to list items in storage
          addLog('Step 6: Listing videos from storage...');
          const videosRef = firebase.ref(storage, 'videos/');
          
          const listPromise = firebase.listAll(videosRef);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout: listAll operation took too long (10s)')), 10000);
          });
          
          try {
            const result = await Promise.race([listPromise, timeoutPromise]) as any;
            
            if (result.items.length === 0 && result.prefixes.length === 0) {
              addLog('⚠️ No videos found in the videos/ directory');
            } else {
              addLog(`✅ Found ${result.items.length} videos and ${result.prefixes.length} folders`);
              
              // 7. Try to get a download URL for the first item
              if (result.items.length > 0) {
                addLog('Step 7: Getting download URL for first video...');
                try {
                  const firstItem = result.items[0];
                  addLog(`   - Testing file: ${firstItem.fullPath}`);
                  
                  const urlPromise = firebase.getDownloadURL(firstItem);
                  const urlTimeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout: getDownloadURL operation took too long (10s)')), 10000);
                  });
                  
                  const url = await Promise.race([urlPromise, urlTimeoutPromise]);
                  addLog(`✅ Got download URL: ${url.substring(0, 50)}...`);
                  addLog('🎉 ALL TESTS PASSED! Your Firebase Storage is working correctly.');
                } catch (urlError) {
                  addLog(`❌ Failed to get download URL: ${(urlError as Error).message}`);
                  addLog('⚠️ This suggests a permissions issue with Firebase Storage rules.');
                }
              }
            }
          } catch (listError) {
            addLog(`❌ Failed to list videos: ${(listError as Error).message}`);
            addLog('⚠️ Common causes: incorrect path, permissions issues, or network problems');
          }
        } catch (storageError) {
          addLog(`❌ Failed to connect to Storage: ${(storageError as Error).message}`);
        }
        
        setStatus('Test completed');
        setTestComplete(true);
      } catch (error) {
        addLog(`❌ Unexpected error: ${(error as Error).message}`);
        setStatus('Test failed');
        setTestComplete(true);
      }
    };

    runTest();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Head>
        <title>Firebase Direct Test</title>
      </Head>
      
      <h1 className="text-2xl font-bold mb-4">Firebase Direct Test</h1>
      <p className="mb-6 text-gray-600">
        This test bypasses your Firebase configuration file and directly tests the connection.
      </p>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Status: {status}</h2>
          {!testComplete && <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>}
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-800 text-white px-4 py-2 font-mono text-sm">
          Firebase Diagnostic Logs
        </div>
        <div className="bg-black text-green-400 p-4 font-mono text-xs overflow-auto h-96">
          {logs.map((log, i) => (
            <div key={i} className="mb-1">
              {log.startsWith('❌') ? <span className="text-red-500">{log}</span> :
               log.startsWith('⚠️') ? <span className="text-yellow-500">{log}</span> :
               log.startsWith('✅') ? <span className="text-green-500">{log}</span> :
               log.startsWith('🎉') ? <span className="text-blue-500 font-bold">{log}</span> :
               log}
            </div>
          ))}
          {!testComplete && <div className="animate-pulse">_</div>}
        </div>
      </div>
      
      <div className="mt-6 bg-blue-50 p-4 rounded border border-blue-200">
        <h2 className="font-semibold mb-2">Next Steps</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>Check Firebase Console to verify your project setup</li>
          <li>Verify Storage Rules allow read access</li>
          <li>Confirm videos were uploaded to the correct path</li>
          <li>Look for errors in the logs above</li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseDirectTest;
