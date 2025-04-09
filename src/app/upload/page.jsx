'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  
  const { user } = useAuth();
  const router = useRouter();
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Validate file type
    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }
    
    // Validate file size (limit to 100MB)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('Video size should be less than 100MB');
      return;
    }
    
    setFile(selectedFile);
    setError('');
  };
  
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be signed in to upload');
      return;
    }
    
    if (!file) {
      setError('Please select a video to upload');
      return;
    }
    
    if (!caption.trim()) {
      setError('Please add a caption');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      // Create a unique filename
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storagePath = `videos/${user.uid}/${filename}`;
      const storageRef = ref(storage, storagePath);
      
      // Upload video with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          // Update progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setError(`Upload failed: ${error.message}`);
          setUploading(false);
        },
        async () => {
          try {
            // Upload completed, get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Create document in Firestore
            await addDoc(collection(db, 'videos'), {
              userId: user.uid,
              username: user.displayName || 'Anonymous',
              caption: caption,
              storagePath: storagePath,
              videoUrl: downloadURL,
              createdAt: serverTimestamp(),
              likes: 0,
              comments: 0
            });
            
            setUploading(false);
            router.push('/');
          } catch (err) {
            console.error('Error saving to database:', err);
            setError(`Error saving to database: ${err.message}`);
            setUploading(false);
          }
        }
      );
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message}`);
      setUploading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-8 ml-64">
      <h1 className="text-3xl font-bold mb-8">Upload Video</h1>
      
      <div className="max-w-2xl mx-auto bg-zinc-900 rounded-lg p-6">
        <form onSubmit={handleUpload}>
          {error && (
            <div className="bg-red-900/30 border border-red-500 p-3 mb-4 rounded">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          <div className="mb-6">
            <label className="block mb-2 text-lg font-medium">Select Video</label>
            <div 
              className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-pink-500"
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div>
                  <p className="text-green-400 mb-2">✓ Video selected</p>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg mb-2">Drop video here or click to browse</p>
                  <p className="text-sm text-gray-400">MP4 or WebM, maximum 100MB</p>
                </div>
              )}
              <input 
                type="file" 
                accept="video/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="caption" className="block mb-2 text-lg font-medium">Caption</label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3 bg-zinc-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Write a caption..."
              rows={3}
              maxLength={150}
            ></textarea>
            <p className="mt-1 text-sm text-right text-gray-400">
              {caption.length}/150
            </p>
          </div>
          
          {uploading && (
            <div className="mb-6">
              <div className="w-full bg-zinc-800 rounded-full h-4 mb-2">
                <div 
                  className="bg-pink-500 h-4 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-center text-sm">{Math.round(uploadProgress)}% uploaded</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
}
