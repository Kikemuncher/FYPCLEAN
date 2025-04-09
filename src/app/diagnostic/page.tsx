'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { app, auth } from '@/lib/firebase';

export default function DiagnosticPage() {
  const [layoutFileContent, setLayoutFileContent] = useState<string | null>(null);
  const [providersFileContent, setProvidersFileContent] = useState<string | null>(null);
  const [homeFileContent, setHomeFileContent] = useState<string | null>(null);
  const [useAuthFileContent, setUseAuthFileContent] = useState<string | null>(null);
  const [firebaseConfig, setFirebaseConfig] = useState({});
  const [authEnabled, setAuthEnabled] = useState(false);
  
  useEffect(() => {
    // This is just for display - can't actually read files from the client
    setLayoutFileContent("Loading layout.tsx...");
    setProvidersFileContent("Loading providers.tsx...");
    setHomeFileContent("Loading page.tsx...");
    setUseAuthFileContent("Loading useAuth.tsx...");

    // Check Firebase initialization
    try {
      // Check if Firebase is initialized
      if (app) {
        const config = {
          apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID
        };
        
        setFirebaseConfig(config);
      }
      
      // Check if auth is initialized
      if (auth) {
        setAuthEnabled(true);
      }
    } catch (error) {
      console.error('Error checking Firebase:', error);
    }
  }, []);
  
  return (
    <div className="bg-black text-white min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Diagnostic</h1>
      
      <div className="bg-red-900/30 border border-red-500 p-4 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-red-400 mb-2">Error Detected: Firebase Configuration</h2>
        <p className="mb-2">Firebase: Error (auth/configuration-not-found)</p>
        <p className="text-gray-300">This error occurs when Firebase is not properly configured or initialized.</p>
      </div>
      
      <div className="space-y-8">
        <div className="bg-zinc-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Firebase Configuration Status</h2>
          
          <div className="space-y-2">
            <p className="text-gray-300">Firebase App Initialized: <span className={app ? "text-green-400" : "text-red-400"}>{app ? "Yes ✅" : "No ❌"}</span></p>
            <p className="text-gray-300">Firebase Auth Enabled: <span className={authEnabled ? "text-green-400" : "text-red-400"}>{authEnabled ? "Yes ✅" : "No ❌"}</span></p>
            
            <div className="mt-4">
              <h3 className="font-medium text-pink-500 mb-2">Environment Variables Check:</h3>
              <div className="bg-zinc-900 p-3 rounded">
                {Object.entries(firebaseConfig).map(([key, value]) => (
                  <p key={key} className="font-mono text-sm">
                    {key}: <span className={value ? "text-green-400" : "text-red-400"}>{value ? "Present" : "Missing"}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How to Fix</h2>
          
          <ol className="list-decimal list-inside space-y-4 text-gray-300">
            <li>
              <p className="font-medium">Check your .env.local file</p>
              <pre className="bg-zinc-900 p-3 rounded text-sm mt-2 overflow-auto">
{`NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id`}
              </pre>
            </li>
            
            <li>
              <p className="font-medium">Enable Authentication in Firebase Console</p>
              <ol className="list-decimal list-inside ml-4 mt-2">
                <li>Go to Firebase Console</li>
                <li>Select your project</li>
                <li>Navigate to "Authentication" in the left sidebar</li>
                <li>Click on "Get Started" or "Sign-in method"</li>
                <li>Enable "Email/Password" provider</li>
              </ol>
            </li>
            
            <li>
              <p className="font-medium">Restart your development server</p>
              <pre className="bg-zinc-900 p-3 rounded text-sm mt-2">npm run dev</pre>
            </li>
          </ol>
        </div>
      </div>
      
      <div className="mt-8">
        <Link href="/" className="text-pink-500 hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
