'use client';

import { useState } from 'react';
import Link from 'next/link';

// Sample videos that don't require Firebase
const SAMPLE_VIDEOS = [
  {
    id: 'sample1',
    name: 'Sample Video 1',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: 'sample2',
    name: 'Sample Video 2',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  },
  {
    id: 'sample3',
    name: 'Sample Video 3',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  }
];

export default function DirectModePage() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % SAMPLE_VIDEOS.length);
  };
  
  const prevVideo = () => {
    setCurrentVideoIndex((prev) => 
      prev === 0 ? SAMPLE_VIDEOS.length - 1 : prev - 1
    );
  };
  
  const currentVideo = SAMPLE_VIDEOS[currentVideoIndex];
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="bg-gradient-to-r from-red-600 to-pink-600 p-4 text-center">
        <h1 className="text-xl font-bold">⚠️ Direct Mode - Network Issues Detected</h1>
        <p className="text-sm">Using sample videos due to Firebase connection issues</p>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="w-full h-full max-w-3xl max-h-screen relative">
          <video 
            src={currentVideo.url}
            className="w-full h-full object-contain"
            controls
            autoPlay
            loop
          />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <h2 className="text-xl font-bold">{currentVideo.name}</h2>
          </div>
          
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
            <button 
              onClick={prevVideo}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-full"
            >
              ←
            </button>
          </div>
          
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <button 
              onClick={nextVideo}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-full"
            >
              →
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-zinc-900 p-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/browser-check" className="text-blue-400 hover:underline">
            Diagnose Network Issues
          </Link>
          <Link href="/" className="text-pink-400 hover:underline">
            Try Normal Mode
          </Link>
        </div>
      </div>
    </div>
  );
}
