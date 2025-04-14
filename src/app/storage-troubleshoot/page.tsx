'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';

export default function StorageTroubleshoot() {
  const [logs, setLogs] = useState<string[]>([]);
  const [networkInfo, setNetworkInfo] = useState({
    online: true,
    downlink: 0,
    rtt: 0,
    connectionType: 'unknown'
  });
  const [results, setResults] = useState<{test: string, result: string, status: 'success' | 'error' | 'pending'}[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  useEffect(() => {
    // Check network status
    setNetworkInfo({
      online: navigator.onLine,
      downlink: (navigator as any).connection?.downlink || 0,
      rtt: (navigator as any).connection?.rtt || 0,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown'
    });
    
    addLog('Starting Firebase Storage troubleshooting');
    
    const runTests = async () => {
      try {
        // Initialize Firebase directly (bypass environment variables)
        addLog('Initializing Firebase with direct config');
        const firebaseConfig = {
          apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I", 
          authDomain: "tiktok-a7af5.firebaseapp.com",
          projectId: "tiktok-a7af5", 
          storageBucket: "tiktok-a7af5.firebasestorage.app", 
          messagingSenderId: "609721475346", 
          appId: "1:609721475346:web:c80084600ed104b6b153cb"
        };
        
        const app = initializeApp(firebaseConfig, 'troubleshoot');
        const storage = getStorage(app);
        
        addLog('Firebase initialized');
        setResults(prev => [...prev, {
          test: 'Firebase Initialization',
          result: 'Firebase successfully initialized',
          status: 'success'
        }]);
        
        // Test 1: Create a very small file and upload
        addLog('Testing small file upload');
        setResults(prev => [...prev, {
          test: 'Small File Upload',
          result: 'Testing...',
          status: 'pending'
        }]);
        
        try {
          // Generate random string
          const testRef = ref(storage, `test/test-${Date.now()}.txt`);
          await uploadString(testRef, 'This is a test file');
          
          addLog('Small file upload successful');
          setResults(prev => prev.map(r => 
            r.test === 'Small File Upload' 
              ? { ...r, result: 'Successfully uploaded small test file', status: 'success' }
              : r
          ));
          
          // Try to get the URL
          const url = await getDownloadURL(testRef);
          addLog(`Got download URL: ${url.substring(0, 50)}...`);
          
        } catch (error: any) {
          addLog(`Small file upload failed: ${error.message}`);
          setResults(prev => prev.map(r => 
            r.test === 'Small File Upload' 
              ? { ...r, result: `Error: ${error.message}`, status: 'error' }
              : r
          ));
        }
        
        // Test CORS with a fetch request
        addLog('Testing CORS configuration');
        setResults(prev => [...prev, {
          test: 'CORS Configuration',
          result: 'Testing...',
          status: 'pending'
        }]);
        
        try {
          const response = await fetch('https://firebasestorage.googleapis.com/v0/b/tiktok-a7af5.appspot.com/o', {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            addLog('CORS request successful');
            setResults(prev => prev.map(r => 
              r.test === 'CORS Configuration' 
                ? { ...r, result: 'CORS is properly configured', status: 'success' }
                : r
            ));
          } else {
            addLog(`CORS request failed with status: ${response.status}`);
            setResults(prev => prev.map(r => 
              r.test === 'CORS Configuration' 
                ? { ...r, result: `Error: HTTP ${response.status}`, status: 'error' }
                : r
            ));
          }
        } catch (error: any) {
          addLog(`CORS test failed: ${error.message}`);
          setResults(prev => prev.map(r => 
            r.test === 'CORS Configuration' 
              ? { ...r, result: `Error: ${error.message}`, status: 'error' }
              : r
          ));
        }
        
      } catch (error: any) {
        addLog(`Initialization error: ${error.message}`);
        setResults(prev => [...prev, {
          test: 'Firebase Initialization',
          result: `Error: ${error.message}`,
          status: 'error'
        }]);
      }
    };
    
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Firebase Storage Troubleshooting</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-zinc-900 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Network Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={networkInfo.online ? 'text-green-500' : 'text-red-500'}>
                {networkInfo.online ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Connection Type:</span>
              <span>{networkInfo.connectionType}</span>
            </div>
            <div className="flex justify-between">
              <span>Downlink Speed:</span>
              <span>{networkInfo.downlink} Mbps</span>
            </div>
            <div className="flex justify-between">
              <span>Round Trip Time:</span>
              <span>{networkInfo.rtt} ms</span>
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-900 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Test Results</h2>
          <div className="space-y-3">
            {results.length === 0 ? (
              <p className="text-gray-400">Running tests...</p>
            ) : (
              results.map((result, i) => (
                <div key={i} className="border-b border-zinc-800 pb-2 last:border-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{result.test}</span>
                    <span className={
                      result.status === 'success' ? 'text-green-500' : 
                      result.status === 'error' ? 'text-red-500' : 'text-yellow-500'
                    }>
                      {result.status === 'pending' ? 'Testing...' : result.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{result.result}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-zinc-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Troubleshooting Guide for "retry-limit-exceeded"</h2>
        <div className="space-y-4">
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h3 className="font-bold mb-2">1. CORS Configuration</h3>
            <p className="text-gray-300 mb-2">Add this to your Firebase Storage CORS configuration in the Firebase Console:</p>
            <pre className="bg-black p-3 rounded text-xs overflow-auto">
              [&#123;
                "origin": ["*"],
                "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
                "maxAgeSeconds": 3600
              &#125;]
            </pre>
          </div>
          
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h3 className="font-bold mb-2">2. Check Network Issues</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Try using a different network (mobile hotspot)</li>
              <li>Disable VPN or proxy if you're using one</li>
              <li>Try a different browser</li>
              <li>Check for any firewall blocking requests</li>
            </ul>
          </div>
          
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h3 className="font-bold mb-2">3. Create a Storage Test File</h3>
            <p className="text-gray-300">
              Go to Firebase Console → Storage → Files and manually upload a test.txt file to 
              ensure your storage is working properly.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-zinc-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Logs</h2>
        <div className="bg-black p-4 rounded-lg max-h-60 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="text-xs text-gray-300 mb-1 font-mono">{log}</div>
          ))}
        </div>
      </div>
      
      <div className="flex gap-4">
        <Link href="/" className="text-pink-500 hover:underline">
          Back to Home
        </Link>
        
        <button 
          onClick={() => window.location.reload()} 
          className="text-blue-400 hover:underline"
        >
          Run Tests Again
        </button>
      </div>
    </div>
  );
}
