"use client";

import React, { useEffect, useState, useRef } from "react";
import { useVideoStore } from "@/store/videoStore";
import { motion } from "framer-motion";

export default function FeedList() {
  // Store state
  const { videos, currentVideoIndex, setCurrentVideoIndex, fetchVideos } = useVideoStore();
  
  // Local state
  const [isClient, setIsClient] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [manualOffset, setManualOffset] = useState(0);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const releaseTimeout = useRef<NodeJS.Timeout | null>(null);
  const wheelEvents = useRef<number[]>([]);
  const lastWheelTime = useRef(0);

  // Space between videos (padding)
  const VIDEO_SPACING = 40; // 40px spacing between videos
  const MAX_MANUAL_OFFSET = 120; // Max pixels to offset during manual scrolling

  // Only run client-side
  useEffect(() => {
    setIsClient(true);
    fetchVideos();
    
    // Set container height
    setContainerHeight(window.innerHeight);
    
    const handleResize = () => {
      setContainerHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      if (releaseTimeout.current) clearTimeout(releaseTimeout.current);
    };
  }, [fetchVideos]);

  // Full navigation (snap to next/prev video)
  const navigateTo = (index: number) => {
    // Don't navigate if already navigating
    if (isScrollLocked) return;
    
    // Don't navigate beyond limits
    if (index < 0 || index >= videos.length) return;
    
    // Reset any manual offset
    setManualOffset(0);
    setIsManualScrolling(false);
    
    // Set scroll lock
    setIsScrollLocked(true);
    
    // Navigate
    setCurrentVideoIndex(index);
    
    // Release lock after animation completes
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    
    scrollTimeout.current = setTimeout(() => {
      setIsScrollLocked(false);
    }, 800);
  };

  // Simple navigation wrappers
  const goToNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      navigateTo(currentVideoIndex + 1);
    }
  };

  const goToPrevVideo = () => {
    if (currentVideoIndex > 0) {
      navigateTo(currentVideoIndex - 1);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Handle wheel event with fast/slow detection
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    const timeSinceLastWheel = now - lastWheelTime.current;
    lastWheelTime.current = now;
    
    // Store recent wheel events for speed calculation
    wheelEvents.current.push(now);
    if (wheelEvents.current.length > 5) {
      wheelEvents.current.shift(); // Keep last 5 events
    }
    
    // Don't process if locked
    if (isScrollLocked) return;
    
    // Calculate wheel speed - fast wheel = many events in short time
    const isFastWheel = wheelEvents.current.length >= 3 && 
                        (wheelEvents.current[wheelEvents.current.length - 1] - 
                         wheelEvents.current[0]) < 300;
    
    if (isFastWheel) {
      // Fast wheel - go to next/prev video
      wheelEvents.current = []; // Reset wheel events
      
      if (e.deltaY > 0) {
        goToNextVideo();
      } else if (e.deltaY < 0) {
        goToPrevVideo();
      }
    } else {
      // Slow wheel - manual offset
      setIsManualScrolling(true);
      
      // Clear any existing timeout
      if (releaseTimeout.current) {
        clearTimeout(releaseTimeout.current);
      }
      
      // Calculate new offset with limits
      let newOffset = manualOffset;
      
      if (e.deltaY > 0) {
        // Scrolling down - increase offset (move content up)
        newOffset = Math.min(newOffset + e.deltaY * 0.3, MAX_MANUAL_OFFSET);
      } else {
        // Scrolling up - decrease offset (move content down)
        newOffset = Math.max(newOffset + e.deltaY * 0.3, -MAX_MANUAL_OFFSET);
      }
      
      setManualOffset(newOffset);
      
      // Reset after no wheel events
      releaseTimeout.current = setTimeout(() => {
        setManualOffset(0);
        setIsManualScrolling(false);
        wheelEvents.current = [];
      }, 300);
    }
  };

  // Touch handling with fast/slow detection
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const touchLastY = useRef(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchLastY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    setIsManualScrolling(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isScrollLocked) return;
    
    const currentY = e.touches[0].clientY;
    const diff = touchLastY.current - currentY;
    touchLastY.current = currentY;
    
    // Update manual offset with limits
    let newOffset = manualOffset + diff * 0.5;
    newOffset = Math.max(Math.min(newOffset, MAX_MANUAL_OFFSET), -MAX_MANUAL_OFFSET);
    setManualOffset(newOffset);
    
    // Clear any existing timeout
    if (releaseTimeout.current) {
      clearTimeout(releaseTimeout.current);
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    // Skip if already scrolling
    if (isScrollLocked) return;
    
    // Calculate distance, time and velocity
    const touchEnd = e.changedTouches[0].clientY;
    const touchDiff = touchStartY.current - touchEnd;
    const touchTime = Date.now() - touchStartTime.current;
    const velocity = Math.abs(touchDiff) / touchTime;
    
    // Fast swipe = high velocity
    const isFastSwipe = velocity > 0.5 && Math.abs(touchDiff) > 50;
    
    if (isFastSwipe) {
      // Fast swipe - go to next/prev video
      if (touchDiff > 0) {
        goToNextVideo();
      } else {
        goToPrevVideo();
      }
    } else {
      // Slow swipe - reset offset
      setManualOffset(0);
      setIsManualScrolling(false);
    }
  };

  // Loading state
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // No videos state
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <p className="text-white">No videos available</p>
      </div>
    );
  }

  // Calculate total reel height including padding
  const totalHeight = videos.length * (containerHeight + VIDEO_SPACING) - VIDEO_SPACING;
  
  // Calculate the Y position for the current video including padding and manual offset
  const currentY = currentVideoIndex * (containerHeight + VIDEO_SPACING) - manualOffset;

  return (
    <div 
      className="h-screen w-full overflow-hidden bg-black relative"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Film reel - full container */}
      <motion.div 
        className="absolute w-full"
        style={{ height: totalHeight }}
        animate={{ 
          y: -currentY 
        }}
        transition={{ 
          duration: isManualScrolling ? 0.2 : 0.6,
          ease: isManualScrolling ? "linear" : [0.32, 0.72, 0.24, 0.99]
        }}
      >
        {/* Each video with spacing */}
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            className="absolute w-full"
            style={{ 
              height: containerHeight, 
              top: index * (containerHeight + VIDEO_SPACING),
            }}
          >
            {/* Only render videos that are close to the current one */}
            {Math.abs(index - currentVideoIndex) <= 1 && (
              <div className="relative w-full h-full">
                {/* Border/padding visual if not current video */}
                {index !== currentVideoIndex && (
                  <div className="absolute inset-x-0 h-8 bg-black/90 z-10" 
                    style={{ 
                      top: index < currentVideoIndex ? 0 : 'auto',
                      bottom: index > currentVideoIndex ? 0 : 'auto'
                    }}
                  />
                )}
                
                {/* The video */}
                <video
                  src={video.videoUrl}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  muted={isMuted}
                  controls={false}
                  autoPlay={index === currentVideoIndex}
                />
                
                {/* Video info */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="font-bold text-white">@{video.username}</p>
                  <p className="text-white text-sm">{video.caption}</p>
                </div>
                
                {/* Actions - only show for current video */}
                {index === currentVideoIndex && (
                  <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-3">
                    <button className="flex flex-col items-center">
                      <div className="rounded-full bg-transparent p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <span className="text-white text-xs">0</span>
                    </button>
                    
                    <button className="flex flex-col items-center">
                      <div className="rounded-full bg-transparent p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <span className="text-white text-xs">0</span>
                    </button>
                    
                    <button className="flex flex-col items-center">
                      <div className="rounded-full bg-transparent p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </div>
                      <span className="text-white text-xs">0</span>
                    </button>
                    
                    <button className="flex flex-col items-center">
                      <div className="rounded-full bg-transparent p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </div>
                      <span className="text-white text-xs">0</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </motion.div>
      
      {/* Navigation Buttons - very far left */}
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-30">
        <button 
          onClick={goToPrevVideo}
          className={`bg-black/50 hover:bg-black/70 text-white rounded-full p-3 ${
            currentVideoIndex === 0 || isScrollLocked ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
          }`}
          disabled={currentVideoIndex === 0 || isScrollLocked}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button 
          onClick={goToNextVideo}
          className={`bg-black/50 hover:bg-black/70 text-white rounded-full p-3 ${
            currentVideoIndex === videos.length - 1 || isScrollLocked ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
          }`}
          disabled={currentVideoIndex === videos.length - 1 || isScrollLocked}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Sound toggle button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className="absolute top-4 right-4 bg-black/30 rounded-full p-2 z-30"
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* Video counter indicator */}
      <div className="absolute top-4 left-4 bg-black/30 rounded-full px-3 py-1 z-30">
        <span className="text-white text-sm">{currentVideoIndex + 1} / {videos.length}</span>
      </div>
    </div>
  );
}
