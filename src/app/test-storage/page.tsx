'use client';

import { useState } from 'react';
import { ref, getDownloadURL, listAll, uploadBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import Link from 'next/link';

export default function TestStoragePage() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detectedVideos, setDetectedVideos] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);

  const testStorage = async () => {
    setLoading(true);
    setTestResults([]);
    setDetectedVideos([]);
    
    try {
      addLog("Starting Firebase Storage tests...");
      
      // 1. Check if storage is initialized
      addLog("Checking Storage initialization...");
      if (storage) {
        addLog(`✅ Storage initialized with bucket: ${storage.app.options.storageBucket}`);
      } else {
        addLog("❌ Storage not initialized");
      }
      
      // 2. Try listing the root directory
      addLog("Trying to list root directory...");
      const rootRef = ref(storage, '/');
      try {
        const rootList = await listAll(rootRef);
        addLog(`✅ Root directory access successful. Found ${rootList.prefixes.length} folders`);
        
        rootList.prefixes.forEach(prefix => {
          addLog(`- Folder: ${prefix.name}`);
        });
        
        // 3. Check if videos folder exists
        const videosRef = ref(storage, 'videos');
        try {
          addLog("Checking for 'videos' folder...");
          const videosList = await listAll(videosRef);
          
          if (videosList.items.length > 0) {
            addLog(`✅ Found ${videosList.items.length} videos in the 'videos' folder`);
            
            // Get details of a few videos
            const videoItems = [];
            for (let i = 0; i < Math.min(3, videosList.items.length); i++) {
              try {
                const url = await getDownloadURL(videosList.items[i]);
                videoItems.push({
                  name: videosList.items[i].name,
                  url
                });
              } catch (e) {
                addLog(`❌ Error getting URL for ${videosList.items[i].name}: ${e.message}`);
              }
            }
            
            setDetectedVideos(videoItems);
          } else {
            addLog("⚠️ 'videos' folder exists but contains no videos");
          }
        } catch (e) {
          addLog(`❌ Error accessing 'videos' folder: ${e.message}`);
        }
      } catch (e) {
        addLog(`❌ Error listing root directory: ${e.message}`);
      }
      
    } catch (error) {
      addLog(`❌ Test failed with error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const uploadTestFile = async () => {
    setUploadStatus("Uploading test file...");
    
    try {
      // Create a small text file
      const textContent = "This is a test file uploaded at " + new Date().toString();
      const blob = new Blob([textContent], { type: 'text/plain' });
      const file = new File([blob], "test.txt", { type: 'text/plain' });
      
      // Upload to a test folder
      const testRef = ref(storage, `test/test_${Date.now()}.txt`);
      await uploadBytes(testRef, file);
      
      // Get the URL
      const url = await getDownloadURL(testRef);
      
      setUploadStatus(`✅ File uploaded successfully! URL: ${url}`);
    } catch (error) {
      setUploadStatus(`❌ Upload failed: ${error.message}`);
    }
  };
  
  const addLog = (message) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Firebase Storage Test</h1>
      
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={testStorage}
          disabled={loading}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Storage'}
        </button>
        
        <button 
          onClick={uploadTestFile}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Upload Test File
        </button>
      </div>
      
      {uploadStatus && (
        <div className={`mb-6 p-4 rounded ${uploadStatus.includes('❌') ? 'bg-red-900/30 border border-red-500' : 'bg-green-900/30 border border-green-500'}`}>
          <p>{uploadStatus}</p>
        </div>
      )}
      
      {detectedVideos.length > 0 && (
        <div className="bg-zinc-900 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-3">Detected Videos</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {detectedVideos.map((video, idx) => (
              <div key={idx} className="bg-zinc-800 p-3 rounded">
                <h3 className="font-medium mb-2">{video.name}</h3>
                <div className="relative pt-[56.25%] bg-black rounded overflow-hidden">
                  <video 
                    src={video.url}
                    className="absolute top-0 left-0 w-full h-full object-contain"
                    controls
                    preload="metadata"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-zinc-900 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-3">Test Results</h2>
        <div className="bg-black p-4 rounded-lg h-60 overflow-y-auto font-mono text-sm">
          {testResults.length > 0 ? (
            testResults.map((log, i) => (
              <div key={i} className={
                log.includes("✅") ? "text-green-400" :
                log.includes("❌") ? "text-red-400" :
                log.includes("⚠️") ? "text-yellow-400" : "text-gray-400"
              }>
                {log}
              </div>
            ))
          ) : (
            <p className="text-gray-500">Click "Test Storage" to begin</p>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex space-x-4">
        <Link href="/" className="text-pink-500 hover:underline">
          Back to Home
        </Link>
        <Link href="/firestore-test" className="text-blue-500 hover:underline">
          Firestore Test
        </Link>
      </div>
    </div>
  );
}
