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
  
  // Scroll state tracking
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<any>(null);
  const scrollLockoutTimer = useRef<any>(null);
  const scrollDirection = useRef<'up' | 'down' | null>(null);
  const lastWheelTime = useRef(0);
  const totalDelta = useRef(0);
  const mouseWheelLockout = useRef(false);
  
  // Set up container height
  useEffect(() => {
    setContainerHeight(window.innerHeight);
    
    const updateHeight = () => {
      setContainerHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      if (scrollLockoutTimer.current) clearTimeout(scrollLockoutTimer.current);
    };
  }, []);
  
  // Toggle mute
  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  // Go to next video
  const goToNextVideo = () => {
    if (currentVideoIndex < VIDEOS.length - 1) {
      setCurrentVideoIndex(prevIndex => prevIndex + 1);
      setOffset(0);
    } else {
      setOffset(0);
    }
  };
  
  // Go to previous video
  const goToPrevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prevIndex => prevIndex - 1);
      setOffset(0);
    } else {
      setOffset(0);
    }
  };
  
  // Completely new wheel handler focused on tactile experience
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const now = performance.now();
    const timeDelta = now - lastWheelTime.current;
    lastWheelTime.current = now;
    
    // IMPORTANT: Detect if this is a trackpad or mouse wheel
    // 1. Trackpads typically have much smaller deltaY values
    // 2. Trackpads often have non-zero deltaX values
    // 3. Trackpad events come in rapid succession
    const isTrackpad = (Math.abs(e.deltaY) < 50 || Math.abs(e.deltaX) > 0) && timeDelta < 100;
    
    // MOUSE WHEEL HANDLING
    if (!isTrackpad) {
      if (!mouseWheelLockout.current) {
        const direction = e.deltaY > 0 ? 'down' : 'up';
        
        if (direction === 'down' && currentVideoIndex < VIDEOS.length - 1) {
          goToNextVideo();
          
          // Prevent multiple navigations
          mouseWheelLockout.current = true;
          setTimeout(() => {
            mouseWheelLockout.current = false;
          }, 400);
        } else if (direction === 'up' && currentVideoIndex > 0) {
          goToPrevVideo();
          
          // Prevent multiple navigations
          mouseWheelLockout.current = true;
          setTimeout(() => {
            mouseWheelLockout.current = false;
          }, 400);
        }
      }
      return;
    }
    
    // TRACKPAD HANDLING
    
    // Keep track of direction
    const direction = e.deltaY > 0 ? 'down' : 'up';
    
    // Start scrolling if not already
    if (!isScrolling.current) {
      isScrolling.current = true;
      scrollDirection.current = direction;
      totalDelta.current = 0;
    }
    
    // Update total delta (for release decision)
    totalDelta.current += e.deltaY;
    
    // TACTILE MOVEMENT: Directly translate trackpad movement to visual offset
    // This is the key part that makes it feel tactile
    
    // Calculate new offset based on current scroll delta
    let sensitivity = 1.0;  // How responsive the scrolling feels
    let newOffset = offset;
    
    if (direction === 'up') {
      // Scrolling up
      if (currentVideoIndex > 0) {
        // We can go to previous video
        newOffset = offset + Math.abs(e.deltaY) * sensitivity;
      } else {
        // Reached the top - elastic resistance
        newOffset = offset + Math.abs(e.deltaY) * 0.2;
      }
    } else {
      // Scrolling down
      if (currentVideoIndex < VIDEOS.length - 1) {
        // We can go to next video
        newOffset = offset - Math.abs(e.deltaY) * sensitivity;
      } else {
        // Reached the bottom - elastic resistance
        newOffset = offset - Math.abs(e.deltaY) * 0.2;
      }
    }
    
    // Apply limits to prevent excessive scrolling
    const maxOffset = containerHeight * 0.8;
    newOffset = Math.max(Math.min(newOffset, maxOffset), -maxOffset);
    
    // Update offset for visual feedback
    setOffset(newOffset);
    
    // Clear any existing scroll timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    // Set a timeout to detect when scrolling stops
    // This timeout gets reset every time a new wheel event comes in
    scrollTimeout.current = setTimeout(() => {
      // Only execute if we were actively scrolling
      if (isScrolling.current) {
        // NAVIGATION DECISION - only happens when scrolling has stopped
        
        // Determine if we've scrolled enough to change videos
        // More generous threshold (20% of screen height)
        const threshold = containerHeight * 0.2;
        
        if (offset > threshold && currentVideoIndex > 0) {
          // Scrolled up enough to go to previous
          goToPrevVideo();
        } else if (offset < -threshold && currentVideoIndex < VIDEOS.length - 1) {
          // Scrolled down enough to go to next
          goToNextVideo();
        } else {
          // Not enough to change - snap back
          setOffset(0);
        }
        
        // Reset tracking state
        isScrolling.current = false;
        scrollDirection.current = null;
        totalDelta.current = 0;
      }
    }, 150); // Wait 150ms after last wheel event to confirm scrolling has stopped
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
