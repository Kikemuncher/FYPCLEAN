'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { uploadVideoComplete } from '@/lib/videoService';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SideNav from '@/components/SideNav'; // Fixed import path
import Link from 'next/link';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [song, setSong] = useState('Original Sound');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { currentUser } = useAuth();
  const router = useRouter();

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
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
    
    // Clean up previous preview if exists
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    
    setFile(selectedFile);
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
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
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Call the complete upload function from videoService
      const result = await uploadVideoComplete(
        currentUser.uid,
        file,
        caption,
        (progress) => setUploadProgress(progress)
      );
      
      if (result.success && result.id) {
        setSuccess(true);
        setUploadedVideoId(result.id);
        // We'll stay on the page with a success message instead of redirecting
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <SideNav />
        
        <div className="ml-64 p-8">
          <h1 className="text-3xl font-bold mb-8">Upload Video</h1>
          
          {success && uploadedVideoId ? (
            <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl mx-auto">
              <div className="bg-green-900/30 border border-green-500 p-4 rounded-md mb-6">
                <p className="text-green-300 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Video uploaded successfully!
                </p>
              </div>
              
              {previewUrl && (
                <div className="aspect-[9/16] bg-zinc-800 rounded-md overflow-hidden mb-4">
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-full object-contain"
                    autoPlay
                    muted
                    loop
                  />
                </div>
              )}
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setCaption('');
                    setSong('Original Sound');
                    setSuccess(false);
                    setUploadedVideoId(null);
                    setUploadProgress(0);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded"
                >
                  Upload Another
                </button>
                
                <Link 
                  href={`/?video=${uploadedVideoId}`} 
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded"
                >
                  View Video
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-zinc-900 rounded-lg p-6">
              {error && (
                <div className="bg-red-900/30 border border-red-500 p-3 mb-4 rounded">
                  <p className="text-red-400">{error}</p>
                </div>
              )}
              
              <div className="mb-6">
                <label className="block mb-2 text-lg font-medium">Select Video</label>
                <div 
                  className="border-2 border-dashed border-gray-700 rounded-lg overflow-hidden transition-colors cursor-pointer hover:border-pink-500"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <div className="aspect-[9/16] w-full relative">
                      <video
                        ref={videoRef}
                        src={previewUrl}
                        className="w-full h-full object-contain bg-zinc-800"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white text-center">Click to change video</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <svg 
                        className="w-16 h-16 mx-auto text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1} 
                          d="M7 4v16M17 4v16M3 8h18M3 16h18" 
                        />
                      </svg>
                      <p className="text-lg mt-4 mb-2">Drag and drop video or click to browse</p>
                      <p className="text-sm text-gray-400">MP4 or WebM, maximum 100MB, 16:9 aspect ratio recommended</p>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="video/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="caption" className="block mb-2 text-lg font-medium">Caption</label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:border-pink-500"
                  placeholder="Write a caption... (use #hashtags)"
                  rows={3}
                  maxLength={150}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {caption.length}/150 characters
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="song" className="block mb-2 text-lg font-medium">Sound</label>
                <input
                  id="song"
                  type="text"
                  value={song}
                  onChange={(e) => setSong(e.target.value)}
                  placeholder="Original Sound"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:border-pink-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave as "Original Sound" for video's audio
                </p>
              </div>
              
              <div className="mb-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(!isPrivate)}
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                  <span className="ml-3 text-sm font-medium">Private video</span>
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Private videos are only visible to you
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || !file}
                className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading... {uploadProgress.toFixed(0)}%
                  </span>
                ) : 'Upload Video'}
              </button>
            </form>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
