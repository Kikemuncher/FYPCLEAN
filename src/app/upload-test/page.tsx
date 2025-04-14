'use client';

import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import Link from 'next/link';

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if it's a video
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // Create a reference to the videos folder
      const storageRef = ref(storage, `videos/test-${Date.now()}-${file.name}`);
      
      // Upload file
      const uploadResult = await uploadBytes(storageRef, file);
      setProgress(100);
      
      // Get download URL
      const url = await getDownloadURL(uploadResult.ref);
      setVideoUrl(url);
      
      console.log('Upload successful:', url);
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-8">Upload Test Video</h1>
      
      <div className="max-w-md mx-auto bg-zinc-900 rounded-lg p-6">
        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-500 rounded">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {!videoUrl ? (
          <div className="space-y-6">
            <div>
              <label className="block mb-2">Select Video File:</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded"
                >
                  Browse Files
                </button>
                <span className="text-gray-400">
                  {file ? file.name : 'No file selected'}
                </span>
              </div>
            </div>
            
            {file && (
              <div>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white py-2 rounded"
                >
                  {uploading ? 'Uploading...' : 'Upload Video'}
                </button>
                
                {uploading && (
                  <div className="mt-4">
                    <div className="bg-zinc-800 h-2 rounded overflow-hidden">
                      <div 
                        className="bg-pink-500 h-full" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-center mt-1 text-sm">{progress}%</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-900/30 border border-green-500 p-3 rounded">
              <p className="text-green-400">Upload successful!</p>
            </div>
            
            <div>
              <p className="mb-2">Video Preview:</p>
              <video 
                src={videoUrl} 
                controls 
                className="w-full rounded bg-black"
              ></video>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setFile(null);
                  setVideoUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded"
              >
                Upload Another
              </button>
              
              <Link href="/" className="bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded">
                Go Home
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Troubleshooting</h2>
        <div className="bg-zinc-900 p-4 rounded">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure your Firebase Storage rules allow write access</li>
            <li>Try uploading a small video file (less than 5MB)</li>
            <li>Check your network connection</li>
            <li>Look at browser console for detailed error messages</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
