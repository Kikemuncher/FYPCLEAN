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
  // For visual feedback during scrolling
  const [offset, setOffset] = useState(0);
  // Container height
  const [containerHeight, setContainerHeight] = useState(0);
  // Video playing state
  const [isMuted, setIsMuted] = useState(false);
  
  // Simple mouse wheel handling
  const wheelTimeout = useRef<any>(null);
  const wheelLock = useRef(false);
  
  // Set up container height
  useEffect(() => {
    setContainerHeight(window.innerHeight);
    window.addEventListener('resize', () => setContainerHeight(window.innerHeight));
    return () => {
      window.removeEventListener('resize', () => setContainerHeight(window.innerHeight));
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    };
  }, []);
  
  // Toggle mute
  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  // Navigation functions
  const goToNextVideo = () => {
    if (currentVideoIndex < VIDEOS.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
      setOffset(0);
    } else {
      setOffset(0);
    }
  };
  
  const goToPrevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
      setOffset(0);
    } else {
      setOffset(0);
    }
  };
  
  // THE SIMPLEST POSSIBLE WHEEL HANDLER
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Mouse wheel detection (large delta, not trackpad)
    const isMouseWheel = Math.abs(e.deltaY) > 50;
    
    // Handle mouse wheel differently
    if (isMouseWheel && !wheelLock.current) {
      // For mouse wheel, navigate immediately
      if (e.deltaY > 0 && currentVideoIndex < VIDEOS.length - 1) {
        goToNextVideo();
      } else if (e.deltaY < 0 && currentVideoIndex > 0) {
        goToPrevVideo();
      }
      
      // Lock wheel briefly to prevent skipping
      wheelLock.current = true;
      setTimeout(() => {
        wheelLock.current = false;
      }, 500);
      
      return;
    }
    
    // TRACKPAD HANDLING: Just update offset
    // Apply a multiplier for sensitivity
    let newOffset = offset - e.deltaY * 0.5;
    
    // Limit maximum scroll distance
    const maxScroll = containerHeight * 0.8;
    newOffset = Math.max(Math.min(newOffset, maxScroll), -maxScroll);
    
    // Apply resistance at boundaries
    if ((newOffset > 0 && currentVideoIndex === 0) || 
        (newOffset < 0 && currentVideoIndex === VIDEOS.length - 1)) {
      newOffset = newOffset * 0.3; // 70% resistance at edges
    }
    
    // Update visual offset
    setOffset(newOffset);
    
    // Clear any existing timer
    if (wheelTimeout.current) {
      clearTimeout(wheelTimeout.current);
    }
    
    // Set a new timer for navigation decision
    // This keeps getting reset as long as you're scrolling
    wheelTimeout.current = setTimeout(() => {
      // Only run when scrolling completely stops
      const threshold = containerHeight * 0.2;
      
      if (offset > threshold && currentVideoIndex > 0) {
        goToPrevVideo();
      } else if (offset < -threshold && currentVideoIndex < VIDEOS.length - 1) {
        goToNextVideo();
      } else {
        // Snap back
        setOffset(0);
      }
    }, 300); // Longer delay to ensure user is done scrolling
  };
  
  return (
    <div 
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
