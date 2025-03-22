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
  
  // Wheel handling with improved tracking
  const wheelEvents = useRef<WheelEvent[]>([]);
  const isWheeling = useRef(false);
  const wheelReleaseTimer = useRef<any>(null);
  const inertiaFrameId = useRef<number | null>(null);
  
  // Track scroll velocity for dynamic sensitivity
  const lastScrollTime = useRef(0);
  const scrollVelocity = useRef(0);
  
  // Set up container height
  useEffect(() => {
    setContainerHeight(window.innerHeight);
    
    const updateHeight = () => {
      setContainerHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      if (wheelReleaseTimer.current) {
        clearTimeout(wheelReleaseTimer.current);
      }
      if (inertiaFrameId.current) {
        cancelAnimationFrame(inertiaFrameId.current);
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
  
  // Smooth snap back animation
  const animateSnapBack = () => {
    const startOffset = offset;
    const startTime = performance.now();
    const duration = 300;
    
    const animateFrame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const newOffset = startOffset * (1 - easedProgress);
      
      setOffset(newOffset);
      
      if (progress < 1) {
        inertiaFrameId.current = requestAnimationFrame(animateFrame);
      } else {
        setOffset(0);
        inertiaFrameId.current = null;
      }
    };
    
    inertiaFrameId.current = requestAnimationFrame(animateFrame);
  };
  
  // Go to next video
  const goToNextVideo = () => {
    if (currentVideoIndex < VIDEOS.length - 1) {
      if (inertiaFrameId.current) {
        cancelAnimationFrame(inertiaFrameId.current);
        inertiaFrameId.current = null;
      }
      
      setOffset(0);
      setCurrentVideoIndex(prev => prev + 1);
    } else {
      setOffset(0);
    }
  };
  
  // Go to previous video
  const goToPrevVideo = () => {
    if (currentVideoIndex > 0) {
      if (inertiaFrameId.current) {
        cancelAnimationFrame(inertiaFrameId.current);
        inertiaFrameId.current = null;
      }
      
      setOffset(0);
      setCurrentVideoIndex(prev => prev - 1);
    } else {
      setOffset(0);
    }
  };
  
  // Process wheel event when scrolling stops
  const handleWheelRelease = () => {
    if (wheelEvents.current.length === 0) return;
    
    if (inertiaFrameId.current) {
      cancelAnimationFrame(inertiaFrameId.current);
      inertiaFrameId.current = null;
    }
    
    // Calculate average delta to determine direction and momentum
    const recentEvents = wheelEvents.current.slice(-5);
    const totalDelta = recentEvents.reduce((sum, event) => sum + event.deltaY, 0);
    const avgDelta = totalDelta / recentEvents.length;
    const direction = avgDelta > 0 ? 'down' : 'up';
    
    // Determine if we've scrolled enough to change videos
    // For trackpad gestures, use momentum-based threshold
    const isTrackpad = recentEvents.some(evt => Math.abs(evt.deltaY) < 30);
    const threshold = containerHeight * (isTrackpad ? 0.2 : 0.1);
    
    if (Math.abs(offset) > threshold) {
      if (offset > 0 && canScrollInDirection('up')) {
        goToPrevVideo();
      } else if (offset < 0 && canScrollInDirection('down')) {
        goToNextVideo();
      } else {
        animateSnapBack();
      }
    } else {
      animateSnapBack();
    }
    
    // Reset wheel tracking
    wheelEvents.current = [];
    isWheeling.current = false;
  };
  
  // Improved wheel handler for both trackpad and mouse wheel
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Calculate time since last scroll event
    const now = performance.now();
    const timeSinceLastScroll = now - lastScrollTime.current;
    lastScrollTime.current = now;
    
    // Cancel any running animations
    if (inertiaFrameId.current) {
      cancelAnimationFrame(inertiaFrameId.current);
      inertiaFrameId.current = null;
    }
    
    // Clear previous wheel release timer
    if (wheelReleaseTimer.current) {
      clearTimeout(wheelReleaseTimer.current);
    }
    
    // Detect input type (trackpad vs mouse wheel)
    const isTrackpad = Math.abs(e.deltaY) < 30 || Math.abs(e.deltaX) > 0;
    const isFastWheel = Math.abs(e.deltaY) > 80;
    const direction = e.deltaY > 0 ? 'down' : 'up';
    
    // For mouse wheel, navigate immediately on fast wheel clicks
    if (!isTrackpad && isFastWheel) {
      // Single wheel click = single navigation
      if (direction === 'down' && canScrollInDirection('down')) {
        goToNextVideo();
        return;
      } else if (direction === 'up' && canScrollInDirection('up')) {
        goToPrevVideo();
        return;
      }
    }
    
    // Store event for trackpad gesture accumulation
    wheelEvents.current.push(e.nativeEvent);
    if (wheelEvents.current.length > 30) {
      wheelEvents.current = wheelEvents.current.slice(-30);
    }
    
    // Mark as actively scrolling
    isWheeling.current = true;
    
    // Apply movement - different handling for trackpad vs mouse wheel
    if (!canScrollInDirection(direction)) {
      // Edge case - elastic resistance
      const elasticFactor = 0.15;
      let elasticDelta = e.deltaY * -elasticFactor;
      let newOffset = offset + elasticDelta;
      
      // Limit elastic pull
      const maxElasticPull = containerHeight * 0.15;
      if (direction === 'up') {
        newOffset = Math.max(newOffset, -maxElasticPull);
      } else {
        newOffset = Math.min(newOffset, maxElasticPull);
      }
      
      setOffset(newOffset);
    } else {
      // Normal scrolling with appropriate sensitivity
      let sensitivity = isTrackpad ? 1.5 : 5;
      let newOffset = offset + e.deltaY * -sensitivity;
      
      // Apply limits
      const maxOffset = containerHeight * 0.8;
      newOffset = Math.max(Math.min(newOffset, maxOffset), -maxOffset);
      
      setOffset(newOffset);
    }
    
    // Set timer to detect when scrolling stops
    wheelReleaseTimer.current = setTimeout(() => {
      if (isWheeling.current) {
        handleWheelRelease();
      }
    }, isTrackpad ? 250 : 100); // Longer timeout for trackpad
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
