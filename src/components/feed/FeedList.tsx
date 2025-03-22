"use client";

import React, { useEffect, useState, useRef } from "react";

// Define video interface
interface Video {
  id: string;
  url: string;
  username: string;
  caption: string;
  song: string;
  likes: number;
  comments: number;
}

// Static data for videos
const VIDEOS: Video[] = [
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
  },
  {
    id: "video4",
    url: "https://assets.mixkit.co/videos/preview/mixkit-taking-photos-from-different-angles-of-a-model-34421-large.mp4",
    username: "fashion_photo",
    caption: "Fashion shoot BTS 📸 #fashion #photoshoot",
    song: "Studio Vibes",
    likes: 23400,
    comments: 870,
  },
  {
    id: "video5",
    url: "https://assets.mixkit.co/videos/preview/mixkit-womans-feet-splashing-in-the-pool-1261-large.mp4",
    username: "pool_vibes",
    caption: "Pool day 💦 #summer #poolside #relax",
    song: "Summer Splash",
    likes: 67800,
    comments: 1540,
  }
];

// Format function for numbers
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
};

function FeedList() {
  // Current active video
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  // Track likes
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  
  // Video playing state
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  
  // Container height
  const [containerHeight, setContainerHeight] = useState(0);
  
  // For scrolling
  const [offset, setOffset] = useState(0);
  
  // Video element references
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  
  // Wheel event handling
  const isWheeling = useRef(false);
  const wheelTimeout = useRef<any>(null);
  const wheelLockout = useRef(false);
  const wheelDirection = useRef<'up' | 'down' | null>(null);
  const wheelCount = useRef(0);
  const lastWheelEvent = useRef<WheelEvent | null>(null);
  
  // Set up container height
  useEffect(() => {
    setContainerHeight(window.innerHeight);
    
    const updateHeight = () => {
      setContainerHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }
    };
  }, []);
  
  // Toggle mute
  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  // Check if scrolling is allowed in the given direction
  const canScrollInDirection = (direction: 'up' | 'down'): boolean => {
    if (direction === 'up') {
      // Can only scroll up if not at the first video
      return currentVideoIndex > 0;
    } else {
      // Can only scroll down if not at the last video
      return currentVideoIndex < VIDEOS.length - 1;
    }
  };
  
  // Go to next video
  const goToNextVideo = () => {
    if (currentVideoIndex < VIDEOS.length - 1) {
      setOffset(0);
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setOffset(0);
    }
  };
  
  // Go to previous video
  const goToPrevVideo = () => {
    if (currentVideoIndex > 0) {
      setOffset(0);
      setCurrentVideoIndex(currentVideoIndex - 1);
    } else {
      setOffset(0);
    }
  };

  // COMPLETELY REWRITTEN wheel handler
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Store the most recent event
    lastWheelEvent.current = e.nativeEvent;
    
    // Detect the input type
    const isTrackpad = Math.abs(e.deltaY) < 40 || Math.abs(e.deltaX) > 0;
    const currDirection = e.deltaY > 0 ? 'down' : 'up';
    
    // For mouse wheel (not trackpad), use a simpler approach that prevents skipping
    if (!isTrackpad) {
      // Only process wheel events if we're not in lockout period
      if (!wheelLockout.current) {
        // Process only one wheel tick at a time
        if (currDirection === 'down' && canScrollInDirection('down')) {
          goToNextVideo();
          // Set a lockout to prevent multiple navigations
          wheelLockout.current = true;
          setTimeout(() => {
            wheelLockout.current = false;
          }, 500); // Half second lockout
        } else if (currDirection === 'up' && canScrollInDirection('up')) {
          goToPrevVideo();
          // Set a lockout to prevent multiple navigations
          wheelLockout.current = true;
          setTimeout(() => {
            wheelLockout.current = false;
          }, 500); // Half second lockout
        }
      }
      
      return; // Early return for mouse wheel - we don't need the trackpad logic
    }
    
    // For trackpad, track continuous movements for visual feedback
    if (!isWheeling.current) {
      isWheeling.current = true;
      wheelDirection.current = currDirection;
      wheelCount.current = 0;
    }
    
    // Increment wheel count for trackpad sensitivity
    wheelCount.current += 1;
    
    // Calculate visual offset for trackpad
    let sensitivity = 0.8; // Lower sensitivity for trackpad
    let newOffset = offset + e.deltaY * -sensitivity;
    
    // Apply limits to prevent excessive scrolling
    const maxOffset = containerHeight * 0.6;
    newOffset = Math.max(Math.min(newOffset, maxOffset), -maxOffset);
    
    // Update offset for visual feedback
    setOffset(newOffset);
    
    // Don't change videos during active scrolling - only decide at the end
    // Clear any existing timeout
    if (wheelTimeout.current) {
      clearTimeout(wheelTimeout.current);
    }
    
    // Set new timeout - only trigger navigation when scrolling stops
    wheelTimeout.current = setTimeout(() => {
      if (isWheeling.current && wheelDirection.current) {
        // Decide if we should change videos based on offset
        const thresholdPercentage = 0.2; // 20% of screen height
        const threshold = containerHeight * thresholdPercentage;
        
        if (Math.abs(offset) > threshold) {
          if (offset > 0 && canScrollInDirection('up')) {
            goToPrevVideo();
          } else if (offset < 0 && canScrollInDirection('down')) {
            goToNextVideo();
          } else {
            // If we can't scroll further, just reset the offset
            setOffset(0);
          }
        } else {
          // Not enough to change, snap back
          setOffset(0);
        }
        
        // Reset tracking
        isWheeling.current = false;
        wheelDirection.current = null;
        wheelCount.current = 0;
      }
    }, 300); // Longer timeout for trackpad to allow complete gestures
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        if (canScrollInDirection('down')) {
          goToNextVideo();
        }
      } else if (e.key === 'ArrowUp') {
        if (canScrollInDirection('up')) {
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
