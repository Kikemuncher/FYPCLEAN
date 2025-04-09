'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NetworkFixPage() {
  const [networkStatus, setNetworkStatus] = useState({
    online: typeof navigator !== 'undefined' ? navigator.onLine : false,
    googleApi: 'Checking...',
    firebaseApi: 'Checking...',
    vpnDetected: 'Checking...'
  });
  
  const [solutions, setSolutions] = useState([]);
  
  useEffect(() => {
    checkNetwork();
  }, []);
  
  const checkNetwork = async () => {
    // Check online status
    setNetworkStatus(prev => ({
      ...prev, 
      online: navigator.onLine
    }));
    
    // Check Google APIs
    try {
      await fetch('https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword', {
        method: 'OPTIONS',
        mode: 'no-cors'
      });
      setNetworkStatus(prev => ({ ...prev, googleApi: 'Reachable' }));
    } catch (error) {
      setNetworkStatus(prev => ({ ...prev, googleApi: 'Unreachable' }));
      addSolution('Google APIs are being blocked by your network');
    }
    
    // Check Firebase APIs
    try {
      await fetch('https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel', {
        method: 'OPTIONS',
        mode: 'no-cors'
      });
      setNetworkStatus(prev => ({ ...prev, firebaseApi: 'Reachable' }));
    } catch (error) {
      setNetworkStatus(prev => ({ ...prev, firebaseApi: 'Unreachable' }));
      addSolution('Firebase APIs are being blocked by your network');
    }
    
    // Check potential VPN or proxy
    const startTime = Date.now();
    try {
      await fetch('https://www.google.com', { mode: 'no-cors' });
      const latency = Date.now() - startTime;
      
      if (latency > 500) {
        setNetworkStatus(prev => ({ ...prev, vpnDetected: 'Likely (High latency)' }));
        addSolution('You may be using a VPN or proxy that\'s interfering with Firebase connections');
      } else {
        setNetworkStatus(prev => ({ ...prev, vpnDetected: 'No' }));
      }
    } catch (error) {
      setNetworkStatus(prev => ({ ...prev, vpnDetected: 'Unknown' }));
    }
    
    // Common solutions
    addSolution('Try disabling any VPN, proxy, or firewall');
    addSolution('Try a different network (e.g., mobile hotspot instead of WiFi)');
    addSolution('Try using a different browser');
    addSolution('Try clearing browser cache and cookies');
  };
  
  const addSolution = (solution) => {
    setSolutions(prev => prev.includes(solution) ? prev : [...prev, solution]);
  };
  
  // Configure system to use direct connection when possible
  const enableDirectConnection = () => {
    if (window.localStorage) {
      window.localStorage.setItem('firebaseForceDirect', 'true');
      window.location.reload();
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Network Connectivity Fixer</h1>
      
      <div className="bg-zinc-900 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-3">Network Status</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Internet Connection:</span>
            <span className={networkStatus.online ? "text-green-500" : "text-red-500"}>
              {networkStatus.online ? "Connected ✅" : "Disconnected ❌"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Google APIs:</span>
            <span className={
              networkStatus.googleApi === "Reachable" ? "text-green-500" : 
              networkStatus.googleApi === "Checking..." ? "text-yellow-500" : "text-red-500"
            }>
              {networkStatus.googleApi}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Firebase APIs:</span>
            <span className={
              networkStatus.firebaseApi === "Reachable" ? "text-green-500" :
              networkStatus.firebaseApi === "Checking..." ? "text-yellow-500" : "text-red-500"
            }>
              {networkStatus.firebaseApi}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>VPN/Proxy Detected:</span>
            <span className={
              networkStatus.vpnDetected === "No" ? "text-green-500" :
              networkStatus.vpnDetected === "Checking..." ? "text-yellow-500" : "text-red-500"
            }>
              {networkStatus.vpnDetected}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-zinc-900 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-3">Solutions</h2>
        {solutions.length > 0 ? (
          <ol className="list-decimal list-inside space-y-2">
            {solutions.map((solution, i) => (
              <li key={i} className="text-yellow-400">{solution}</li>
            ))}
          </ol>
        ) : (
          <p>Analyzing your network...</p>
        )}
        
        <div className="mt-4 p-3 bg-zinc-800 rounded">
          <h3 className="font-bold mb-2">Try These Steps:</h3>
          <ol className="list-decimal list-inside space-y-3">
            <li className="text-gray-300">
              <strong>Check if your network blocks Firebase</strong>
              <p className="text-sm text-gray-400 ml-6">
                Some corporate/school networks block Firebase services.
              </p>
            </li>
            <li className="text-gray-300">
              <strong>Try using a browser without extensions</strong>
              <p className="text-sm text-gray-400 ml-6">
                Privacy extensions can block Firebase connections.
              </p>
            </li>
            <li className="text-gray-300">
              <strong>Try a different internet connection</strong>
              <p className="text-sm text-gray-400 ml-6">
                Use a mobile hotspot instead of WiFi to test.
              </p>
            </li>
            <li className="text-gray-300">
              <strong>Clear site data and cookies</strong>
              <p className="text-sm text-gray-400 ml-6">
                Go to browser settings and clear all site data.
              </p>
            </li>
          </ol>
        </div>
        
        <div className="mt-4">
          <button
            onClick={enableDirectConnection}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Force Direct Connection
          </button>
        </div>
      </div>
      
      <div className="mt-6 flex space-x-4">
        <button 
          onClick={checkNetwork}
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
