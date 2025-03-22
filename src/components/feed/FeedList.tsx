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
    likes: 45600,
    comments: 1230,
  },
  {
    id: "video2",
    url: "https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4",
    username: "nature_lover",
    caption: "Nature day with marshmallows 🌿 #outdoors #camping",
    song: "Nature Sounds",
    likes: 34500,
    comments: 980,
  },
  {
    id: "video3",
    url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
    username: "neon_vibes",
    caption: "Neon lights at night ✨ #aesthetic #nightlife",
    song: "Neon Dreams",
    likes: 78900,
    comments: 2340,
  }
];

function FeedList() {
  // Current active video
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  // For visual feedback during scrolling
  const [offset, setOffset] = useState(0);
  
  // Container height
  const [containerHeight, setContainerHeight] = useState(0);
  
  // Video element references
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  
  // Video playing state
  const [isMuted, setIsMuted] = useState(false);
  
  // Wheel handling
  const wheelLock = useRef(false);           // For mouse wheel lock
  const lastScrollTime = useRef(0);         // Last time we got a scroll
  const scrollTimer = useRef<any>(null);    // Timer to detect end of scrolling
  
  // SUPER SIMPLE STRATEGY:
  // 1. Always just set offset with a multiplier for visual feedback
  // 2. Mouse wheel: navigate immediately 
  // 3. Trackpad: only decide when scrolling completely stops
  
  useEffect(() => {
    setContainerHeight(window.innerHeight);
    
    const updateHeight = () => {
      setContainerHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, []);
  
  // Toggle mute
  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  // Go to next/prev
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
  
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const now = performance.now();
    const timeSinceLastScroll = now - lastScrollTime.current;
    lastScrollTime.current = now;
    
    // Better detection of trackpad:
    // - Very small deltaY values
    // - Presence of deltaX
    // - Rapid succession of events
    const isTrackpad = (Math.abs(e.deltaY) < 30 || Math.abs(e.deltaX) > 0) && timeSinceLastScroll < 50;
    
    // For mouse wheel
    if (!isTrackpad) {
      // Only trigger once per wheel "click"
      if (!wheelLock.current) {
        if (e.deltaY > 0 && currentVideoIndex < VIDEOS.length - 1) {
          goToNextVideo();
        } else if (e.deltaY < 0 && currentVideoIndex > 0) {
          goToPrevVideo();
        }
        
        // Lock wheel and set timeout
        wheelLock.current = true;
        setTimeout(() => {
          wheelLock.current = false;
        }, 500);
      }
      return;
    }
    
    // For trackpad - ALWAYS maintain the visual offset while scrolling 
    // Calculate new offset for visual feedback (not navigation)
    const multiplier = 0.6; // Adjust sensitivity
    let delta = e.deltaY * -multiplier;
    
    // Apply limits & resistance at boundaries
    if ((delta > 0 && currentVideoIndex === 0) || 
        (delta < 0 && currentVideoIndex === VIDEOS.length - 1)) {
      // At boundaries, apply resistance
      delta *= 0.3;
    }
    
    // Update the visual offset
    const newOffset = offset + delta;
    
    // Limit max offset
    const maxOffset = containerHeight * 0.7;
    const limitedOffset = Math.max(Math.min(newOffset, maxOffset), -maxOffset);
    
    // Update offset for visual feedback
    setOffset(limitedOffset);
    
    // Reset the timer for scroll end detection
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }
    
    // Set new timer - this keeps getting cleared as long as you're scrolling
    scrollTimer.current = setTimeout(() => {
      // Only make a decision when scrolling COMPLETELY stops
      
      // Check if we've pulled enough to change videos
      const threshold = containerHeight * 0.22;
      
      if (offset > threshold && currentVideoIndex > 0) {
        // Go to previous video
        goToPrevVideo();
      } else if (offset < -threshold && currentVideoIndex < VIDEOS.length - 1) {
        // Go to next video
        goToNextVideo();
      } else {
        // Not enough to change, snap back
        setOffset(0);
      }
    }, 200);
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
                        ref={(el) => { if (el) videoRefs.current[video.id] = el; }}
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
      
      {/* Video counter indicator */}
      <div className="absolute top-4 left-4 bg-black/30 rounded-full px-3 py-1 z-30">
        <span className="text-white text-sm">{currentVideoIndex + 1} / {VIDEOS.length}</span>
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
    </div>
  );
}

export default FeedList;
