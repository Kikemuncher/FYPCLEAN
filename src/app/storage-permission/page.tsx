'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function StoragePermission() {
  const [copied, setCopied] = useState(false);
  
  const storageRules = `// Storage rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read anything
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(storageRules);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Firebase Storage Permissions Fix</h1>
      
      <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-red-400 mb-3">Permission Error Detected</h2>
        <p className="text-gray-300 mb-2">
          Your Firebase Storage rules are preventing access to your content. This is causing the 
          <code className="bg-black/50 px-1 rounded mx-1">storage/unauthorized</code> error.
        </p>
      </div>
      
      <div className="bg-zinc-900 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Follow These Steps:</h2>
        
        <ol className="list-decimal pl-5 space-y-6">
          <li className="text-gray-200">
            <strong className="text-white">Open Firebase Console</strong>
            <p className="mt-1 text-gray-400">Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Firebase Console</a> and select your project</p>
          </li>
          
          <li className="text-gray-200">
            <strong className="text-white">Navigate to Storage Rules</strong>
            <p className="mt-1 text-gray-400">Go to <span className="bg-zinc-800 px-1 rounded">Storage</span> → <span className="bg-zinc-800 px-1 rounded">Rules</span></p>
          </li>
          
          <li className="text-gray-200">
            <strong className="text-white">Update Your Rules</strong>
            <p className="mt-1 text-gray-400">Replace existing rules with:</p>
            <div className="relative mt-2">
              <pre className="bg-zinc-800 p-4 rounded text-sm overflow-auto">
                {storageRules}
              </pre>
              <button 
                className="absolute top-2 right-2 bg-zinc-700 hover:bg-zinc-600 text-xs py-1 px-2 rounded"
                onClick={handleCopy}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </li>
          
          <li className="text-gray-200">
            <strong className="text-white">Publish the Rules</strong>
            <p className="mt-1 text-gray-400">Click <span className="bg-blue-900 px-2 py-0.5 rounded">Publish</span> button</p>
          </li>
          
          <li className="text-gray-200">
            <strong className="text-white">Come Back and Test Again</strong>
            <p className="mt-1 text-gray-400">Return to your app and refresh to see if the issue is resolved</p>
          </li>
        </ol>
      </div>
      
      <div className="bg-zinc-900 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Understanding Storage Rules</h2>
        
        <div className="space-y-4">
          <p className="text-gray-300">
            The rules above will:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-300">
            <li>Allow <span className="text-green-400">anyone</span> to <span className="text-green-400">read</span> all files in your storage</li>
            <li>Allow <span className="text-green-400">only authenticated users</span> to <span className="text-green-400">upload</span> files</li>
          </ul>
          
          <div className="bg-yellow-900/30 border border-yellow-500 rounded p-3 mt-4">
            <p className="text-yellow-200 text-sm">
              <strong>Note:</strong> If you need more specific rules for production, you should update them accordingly. These rules are permissive to fix the current error.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <Link href="/" className="text-pink-500 hover:underline">
          Back to Home
        </Link>
        
        <Link href="/test-connection" className="text-blue-400 hover:underline">
          Test Connection Again
        </Link>
      </div>
    </div>
  );
}
