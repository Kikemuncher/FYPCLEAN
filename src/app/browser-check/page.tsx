'use client';

import { useState, useEffect } from 'react';
import { checkFirebaseConnection } from '@/lib/firebase';
import Link from 'next/link';

export default function BrowserCheckPage() {
  const [checks, setChecks] = useState({
    browserInfo: 'Checking...',
    corsSupport: 'Checking...',
    networkConnection: 'Checking...',
    firebaseAccess: 'Checking...',
    googleApiAccess: 'Checking...',
    webSocketSupport: 'Checking...'
  });
  
  useEffect(() => {
    // Get browser info
    const browser = getBrowserInfo();
    setChecks(prev => ({ ...prev, browserInfo: browser }));
    
    // Check CORS support
    checkCors();
    
    // Check network connection
    checkNetworkConnection();
    
    // Check Firebase access
    checkFirebaseAccess();
    
    // Check Google API access
    checkGoogleApiAccess();
    
    // Check WebSocket support
    checkWebSocketSupport();
  }, []);
  
  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    let browserName;
    
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "Chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "Firefox";
    } else if (userAgent.match(/safari/i)) {
      browserName = "Safari";
    } else if (userAgent.match(/opr\//i)) {
      browserName = "Opera";
    } else if (userAgent.match(/edg/i)) {
      browserName = "Edge";
    } else {
      browserName = "Unknown";
    }
    
    return `${browserName} on ${navigator.platform}`;
  };
  
  const checkCors = async () => {
    try {
      const response = await fetch('https://cors-test.appspot.com/test', {
        method: 'GET'
      });
      
      if (response.ok) {
        setChecks(prev => ({ ...prev, corsSupport: 'Supported ✅' }));
      } else {
        setChecks(prev => ({ ...prev, corsSupport: 'Limited ⚠️' }));
      }
    } catch (error) {
      setChecks(prev => ({ ...prev, corsSupport: 'Restricted ❌' }));
    }
  };
  
  const checkNetworkConnection = () => {
    if (navigator.onLine) {
      setChecks(prev => ({ ...prev, networkConnection: 'Online ✅' }));
      
      // Additional check with ping
      const start = Date.now();
      fetch('https://www.google.com/favicon.ico', { 
        mode: 'no-cors',
        cache: 'no-store'
      })
      .then(() => {
        const latency = Date.now() - start;
        setChecks(prev => ({ ...prev, networkConnection: `Online ✅ (${latency}ms)` }));
      })
      .catch(() => {
        setChecks(prev => ({ ...prev, networkConnection: 'Limited connectivity ⚠️' }));
      });
    } else {
      setChecks(prev => ({ ...prev, networkConnection: 'Offline ❌' }));
    }
  };
  
  const checkFirebaseAccess = async () => {
    const isConnected = await checkFirebaseConnection();
    setChecks(prev => ({ 
      ...prev, 
      firebaseAccess: isConnected ? 'Accessible ✅' : 'Blocked ❌'
    }));
  };
  
  const checkGoogleApiAccess = async () => {
    try {
      const start = Date.now();
      await fetch('https://www.googleapis.com/discovery/v1/apis', { 
        mode: 'no-cors',
        cache: 'no-store'
      });
      const latency = Date.now() - start;
      setChecks(prev => ({ ...prev, googleApiAccess: `Accessible ✅ (${latency}ms)` }));
    } catch (error) {
      setChecks(prev => ({ ...prev, googleApiAccess: 'Blocked ❌' }));
    }
  };
  
  const checkWebSocketSupport = () => {
    try {
      // Check if WebSocket is supported
      if ('WebSocket' in window) {
        // Try to create a WebSocket
        const socket = new WebSocket('wss://echo.websocket.org');
        socket.onopen = () => {
          setChecks(prev => ({ ...prev, webSocketSupport: 'Supported ✅' }));
          socket.close();
        };
        socket.onerror = () => {
          setChecks(prev => ({ ...prev, webSocketSupport: 'Blocked ⚠️' }));
        };
      } else {
        setChecks(prev => ({ ...prev, webSocketSupport: 'Not supported ❌' }));
      }
    } catch (e) {
      setChecks(prev => ({ ...prev, webSocketSupport: 'Error ❌' }));
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Browser Compatibility Check</h1>
      
      <div className="bg-zinc-900 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-3">System Information</h2>
        <ul className="space-y-2">
          <li>
            <span className="text-gray-400">Browser:</span> {checks.browserInfo}
          </li>
          <li>
            <span className="text-gray-400">CORS Support:</span> {checks.corsSupport}
          </li>
          <li>
            <span className="text-gray-400">Network Connection:</span> {checks.networkConnection}
          </li>
          <li>
            <span className="text-gray-400">Firebase Access:</span> {checks.firebaseAccess}
          </li>
          <li>
            <span className="text-gray-400">Google API Access:</span> {checks.googleApiAccess}
          </li>
          <li>
            <span className="text-gray-400">WebSocket Support:</span> {checks.webSocketSupport}
          </li>
        </ul>
      </div>
      
      <div className="bg-zinc-900 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-3">Firewall & Network Issues</h2>
        <p className="mb-4">If your checks show blocked services, your network might be restricting Firebase connections.</p>
        
        <h3 className="font-bold mt-3">Common Solutions:</h3>
        <ol className="list-decimal list-inside space-y-2 mt-2">
          <li>Try disabling any ad-blockers or privacy extensions</li>
          <li>Try connecting through a different network (e.g. mobile hotspot)</li>
          <li>Check if your organization blocks access to Google Cloud/Firebase</li>
          <li>Try using a different browser</li>
          <li>Try using incognito/private browsing mode</li>
        </ol>
      </div>
      
      <div className="bg-zinc-900 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-3">Direct Mode</h2>
        <p className="mb-2">As a workaround, you can try the direct mode which uses simpler methods to access content:</p>
        <Link href="/direct-mode" className="bg-pink-500 text-white py-2 px-4 rounded inline-block">
          Try Direct Mode
        </Link>
      </div>
      
      <div className="mt-6">
        <Link href="/" className="text-pink-500 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
