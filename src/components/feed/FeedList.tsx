"use client";

import React, { useEffect, useState, useRef } from "react";

// Static data for videos
const VIDEOS = [
  {
    id: "video1",
    url: "https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4",
    username: "holiday_user",
    caption: "Christmas decorations with family #holidays",
    song: "Holiday Vibes",
  },
  {
    id: "video2",
    url: "https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4",
    username: "nature_lover",
    caption: "Nature day with marshmallows 🌿 #outdoors #camping",
    song: "Nature Sounds",
  },
  {
    id: "video3",
    url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
    username: "neon_vibes",
    caption: "Neon lights at night ✨ #aesthetic #nightlife",
    song: "Neon Dreams",
  }
];

function FeedList() {
  // Current active video
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  // Visual offset
  const [offset, setOffset] = useState(0);
  // Container height
  const [containerHeight, setContainerHeight] = useState(0);
  // Video playing state
  const [isMuted, setIsMuted] = useState(false);
  
  // Mouse wheel tracking
  const wheelLock = useRef(false);
  
  // Trackpad tracking
  const trackpadActive = useRef(false);
  const touchActive = useRef(false);
  const trackpadDelta = useRef(0);
  
  // Ref to the container div for tracking events
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set up container height
  useEffect(() => {
    setContainerHeight(window.innerHeight);
    window.addEventListener('resize', () => setContainerHeight(window.innerHeight));
    return () => window.removeEventListener('resize', () => setContainerHeight(window.innerHeight));
  }, []);
  
  // Set up touch detection
  useEffect(() => {
    // Global handlers for trackpad touch detection
    const handleTouchStart = () => {
      touchActive.current = true;
    };
    
    const handleTouchEnd = () => {
      // Only make navigation decisions on actual touch release
      if (touchActive.current && trackpadActive.current) {
        // Calculate threshold for navigation
        const threshold = containerHeight * 0.2;
        
        // Decide navigation based on offset position
        if (offset > threshold && currentVideoIndex > 0) {
          goToPrevVideo();
        } else if (offset < -threshold && currentVideoIndex < VIDEOS.length - 1) {
          goToNextVideo();
        } else {
          setOffset(0);
        }
        
        // Reset state
        trackpadActive.current = false;
      }
      
      touchActive.current = false;
    };
    
    // Add event listeners for touch detection
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('pointerdown', handleTouchStart);
    window.addEventListener('pointerup', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('pointerdown', handleTouchStart);
      window.removeEventListener('pointerup', handleTouchEnd);
    };
  }, [containerHeight, currentVideoIndex, offset]);
  
  // Toggle mute
  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  // Go to next video
  const goToNextVideo = () => {
    if (currentVideoIndex < VIDEOS.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
      setOffset(0);
      trackpadDelta.current = 0;
    } else {
      setOffset(0);
      trackpadDelta.current = 0;
    }
  };
  
  // Go to previous video
  const goToPrevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
      setOffset(0);
      trackpadDelta.current = 0;
    } else {
      setOffset(0);
      trackpadDelta.current = 0;
    }
  };
  
  // Wheel handler for both mouse wheel and trackpad
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Detect if this is mouse wheel or trackpad
    const isMouseWheel = Math.abs(e.deltaY) > 40 && Math.abs(e.deltaX) === 0;
    
    // Handle mouse wheel differently
    if (isMouseWheel && !wheelLock.current) {
      // For mouse wheel, navigate immediately
      if (e.deltaY > 0 && currentVideoIndex < VIDEOS.length - 1) {
        goToNextVideo();
      } else if (e.deltaY < 0 && currentVideoIndex > 0) {
        goToPrevVideo();
      }
      
      // Prevent multiple rapid navigations
      wheelLock.current = true;
      setTimeout(() => {
        wheelLock.current = false;
      }, 500);
      
      return;
    }
    
    // For trackpad, mark as active
    trackpadActive.current = true;
    
    // Accumulate movement delta
    trackpadDelta.current += e.deltaY;
    
    // Calculate visual offset - direct translation of movement
    const sensitivity = 0.7;
    let newOffset = -trackpadDelta.current * sensitivity;
    
    // Apply limits to prevent excessive scrolling
    const maxOffset = containerHeight * 0.8;
    newOffset = Math.max(Math.min(newOffset, maxOffset), -maxOffset);
    
    // Apply resistance at boundaries
    if ((newOffset > 0 && currentVideoIndex === 0) || 
        (newOffset < 0 && currentVideoIndex === VIDEOS.length - 1)) {
      newOffset = newOffset * 0.3; // 70% resistance
    }
    
    // Update visual offset - directly follows finger position
    setOffset(newOffset);
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        if (currentVideoIndex < VIDEOS.length - 1) {
          goToNextVideo();
        }
      } else if (e.key === 'ArrowUp') {
        if (currentVideoIndex > 0) {
          goToPrevVideo();
        }
      } else if (e.key === 'm') {
        toggleMute();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex]);
  
  return (
    <div 
      ref={containerRef}
      className="h-screen w-full overflow-hidden bg-black relative"
      onWheel={handleWheel}
    >
      <div className="w-full h-full flex justify-center">
        <div 
          className="relative"
          style={{ 
            width: "100%",
            maxWidth: `${containerHeight * 9 / 16}px`,
            height: "100%"
          }}
        >
          <div 
            className="absolute w-full transition-transform duration-300 ease-out"
            style={{ 
              height: containerHeight * VIDEOS.length,
              transform: `translateY(${-currentVideoIndex * containerHeight + offset}px)`,
            }}
          >
            {VIDEOS.map((video, index) => {
              const isVisible = Math.abs(index - currentVideoIndex) <= 1;
              
              return (
                <div 
                  key={video.id} 
                  className="absolute w-full"
                  style={{ 
                    height: containerHeight,
                    top: index * containerHeight,
                  }}
                >
                  {isVisible && (
                    <div className="relative w-full h-full overflow-hidden">
                      <video
                        src={video.url}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        loop
                        playsInline
                        muted={isMuted}
                        preload="auto"
                        autoPlay
                      />
                      
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                        <p className="font-bold text-white">@{video.username}</p>
                        <p className="text-white text-sm mb-4">{video.caption}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Sound toggle button */}
      <button 
        onClick={toggleMute}
        className="absolute top-4 right-4 bg-black/30 rounded-full p-2 z-30"
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      <div className="absolute top-4 left-4 bg-black/30 rounded-full px-3 py-1 z-30">
        <span className="text-white text-sm">{currentVideoIndex + 1} / {VIDEOS.length}</span>
      </div>
    </div>
  );
}

export default FeedList;
