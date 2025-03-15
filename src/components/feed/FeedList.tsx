"use client";

import React, { useEffect, useState } from "react";
import { useVideoStore } from "@/store/videoStore";
import Image from "next/image";

export default function FeedList() {
  const { videos, currentVideoIndex, setCurrentVideoIndex, fetchVideos } = useVideoStore();
  const [isClient, setIsClient] = useState(false);

  // Only run after component mounts (client-side)
  useEffect(() => {
    setIsClient(true);
    fetchVideos();
  }, [fetchVideos]);

  const handleNext = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  // Simple touch handling
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    if (distance > 50 && currentVideoIndex < videos.length - 1) {
      // Swipe up - next video
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (distance < -50 && currentVideoIndex > 0) {
      // Swipe down - previous video
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Simple wheel handling
  const handleWheel = (e) => {
    if (e.deltaY > 0 && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (e.deltaY < 0 && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  // Handle server-side rendering gracefully
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Show fallback if no videos are available
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <p className="text-white">No videos available</p>
      </div>
    );
  }

  const currentVideo = videos[currentVideoIndex];

  return (
    <div 
      className="h-screen w-full overflow-hidden bg-black relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {currentVideo && (
        <div className="relative h-full w-full">
          {/* Video element */}
          <video
            key={currentVideo.id}
            src={currentVideo.videoUrl}
            className="h-full w-full object-cover"
            autoPlay
            muted={false}
            loop
            playsInline
          />
          
          {/* Video info */}
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="font-bold text-white">@{currentVideo.username}</p>
            <p className="text-white text-sm">{currentVideo.caption}</p>
          </div>
          
          {/* Action buttons */}
          <div className="absolute right-2 bottom-24 flex flex-col items-center space-y-4">
            <button className="flex flex-col items-center">
              <div className="rounded-full bg-transparent p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-white text-xs">0</span>
            </button>
            
            <button className="flex flex-col items-center">
              <div className="rounded-full bg-transparent p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-white text-xs">0</span>
            </button>
            
            <button className="flex flex-col items-center">
              <div className="rounded-full bg-transparent p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <span className="text-white text-xs">0</span>
            </button>
            
            <button className="flex flex-col items-center">
              <div className="rounded-full bg-transparent p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <span className="text-white text-xs">0</span>
            </button>
          </div>
          
          {/* Navigation buttons */}
          <div className="absolute left-4 bottom-24 flex flex-col space-y-4">
            <button 
              onClick={handlePrev}
              disabled={currentVideoIndex === 0}
              className={`bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition ${currentVideoIndex === 0 ? 'opacity-50' : 'opacity-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button 
              onClick={handleNext}
              disabled={currentVideoIndex === videos.length - 1}
              className={`bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition ${currentVideoIndex === videos.length - 1 ? 'opacity-50' : 'opacity-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Video counter */}
          <div className="absolute top-4 right-4 bg-black/30 rounded-full px-2 py-1">
            <span className="text-white text-xs">{currentVideoIndex + 1}/{videos.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
