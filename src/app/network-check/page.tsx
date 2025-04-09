'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NetworkCheckPage() {
  const [networkStatus, setNetworkStatus] = useState({
    online: typeof navigator !== 'undefined' ? navigator.onLine : false,
    dns: 'Checking...',
    firebase: 'Checking...',
    latency: null
  });
  
  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setNetworkStatus(prev => ({
        ...prev,
        online: navigator.onLine
      }));
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Check DNS resolution
    const checkDNS = async () => {
      try {
        const startTime = Date.now();
        const response = await fetch('https://www.google.com/favicon.ico', {
          mode: 'no-cors',
          cache: 'no-cache'
        });
        const endTime = Date.now();
        
        setNetworkStatus(prev => ({
          ...prev,
          dns: 'Working',
          latency: endTime - startTime
        }));
      } catch (error) {
        setNetworkStatus(prev => ({
          ...prev,
          dns: `Failed: ${error.message}`
        }));
      }
    };
    
    // Check Firebase connectivity
    const checkFirebase = async () => {
      try {
        const startTime = Date.now();
        const response = await fetch('https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel', {
          method: 'OPTIONS',
          mode: 'no-cors'
        });
        const endTime = Date.now();
        
        setNetworkStatus(prev => ({
          ...prev,
          firebase: 'Reachable',
          firebaseLatency: endTime - startTime
        }));
      } catch (error) {
        setNetworkStatus(prev => ({
          ...prev,
          firebase: `Unreachable: ${error.message}`
        }));
      }
    };
    
    checkDNS();
    checkFirebase();
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Network Connectivity Check</h1>
      
      <div className="bg-zinc-900 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-3">Network Status</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Browser reports online:</span>
            <span className={networkStatus.online ? "text-green-500" : "text-red-500"}>
              {networkStatus.online ? "Yes ✅" : "No ❌"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>DNS Resolution:</span>
            <span className={
              networkStatus.dns === "Working" ? "text-green-500" : 
              networkStatus.dns === "Checking..." ? "text-yellow-500" : "text-red-500"
            }>
              {networkStatus.dns}
              {networkStatus.latency && networkStatus.dns === "Working" && 
                ` (${networkStatus.latency}ms)`
              }
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Firebase Reachable:</span>
            <span className={
              networkStatus.firebase === "Reachable" ? "text-green-500" :
              networkStatus.firebase === "Checking..." ? "text-yellow-500" : "text-red-500"
            }>
              {networkStatus.firebase}
              {networkStatus.firebaseLatency && networkStatus.firebase === "Reachable" && 
                ` (${networkStatus.firebaseLatency}ms)`
              }
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-zinc-900 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-3">Troubleshooting Firebase Timeouts</h2>
        <ol className="list-decimal list-inside space-y-3">
          <li>
            <strong>Check Your Network Connection</strong>
            <p className="ml-6 text-sm text-gray-300">
              Make sure you're connected to the internet. Try opening other websites.
            </p>
          </li>
          
          <li>
            <strong>Verify Firebase Rules</strong>
            <p className="ml-6 text-sm text-gray-300">
              Go to Firebase Console → Firestore Database → Rules and ensure your rules allow read/write access:
            </p>
            <pre className="ml-6 mt-1 p-2 bg-black text-green-400 text-xs rounded overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // For testing only
    }
  }
}`}
            </pre>
          </li>
          
          <li>
            <strong>Check Storage Rules</strong>
            <p className="ml-6 text-sm text-gray-300">
              Go to Firebase Console → Storage → Rules and verify:
            </p>
            <pre className="ml-6 mt-1 p-2 bg-black text-green-400 text-xs rounded overflow-x-auto">
{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;  // For testing only
    }
  }
}`}
            </pre>
          </li>
          
          <li>
            <strong>Try Incognito/Private Mode</strong>
            <p className="ml-6 text-sm text-gray-300">
              Open your app in an incognito window to rule out browser extensions or cache issues.
            </p>
          </li>
          
          <li>
            <strong>Check for Firewall/Network Restrictions</strong>
            <p className="ml-6 text-sm text-gray-300">
              Some networks block Google/Firebase services. Try a different network.
            </p>
          </li>
        </ol>
      </div>
      
      <div className="mt-6 flex space-x-4">
        <button 
          onClick={() => window.location.reload()}
          className="bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded"
        >
          Re-Check Network
        </button>
        <Link href="/" className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
