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

// Static data to ensure we always have videos
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

// Simple format function for large numbers
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
};

function FeedList(): JSX.Element {
  // Client-side rendering detection
  const [isClient, setIsClient] = useState<boolean>(false);
  
  // Current active video
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  
  // Track likes
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  
  // Video playing state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Container height and width
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  
  // Direct translation for videos container
  // This allows for partial scrolling without snapping
  const [translateY, setTranslateY] = useState<number>(0);
  
  // Animation frame ID for inertial scrolling
  const animationRef = useRef<number | null>(null);
  
  // Video element references
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  
  // Mouse/touch tracking
  const isDragging = useRef<boolean>(false);
  const startY = useRef<number | null>(null);
  const lastY = useRef<number>(0);
  const velocity = useRef<number>(0);
  const lastVelocity = useRef<number[]>([]);
  const lastTimestamp = useRef<number>(0);
  const lastTap = useRef<number>(0);
  
  // Wheel specific handling
  const wheelType = useRef<'mouse' | 'trackpad' | null>(null);
  const wheelAccumulator = useRef<number>(0);
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Track if we should snap to video after scrolling
  const shouldSnapToVideo = useRef<boolean>(true);
  
  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
    updateDimensions();
    
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Update container dimensions
  const updateDimensions = () => {
    const height = window.innerHeight;
    // Calculate width to maintain 9:16 aspect ratio
    const width = Math.min(window.innerWidth, height * 9 / 16);
    
    setContainerHeight(height);
    setContainerWidth(width);
    
    // Update translate to match current video
    setTranslateY(-currentVideoIndex * height);
  };
  
  // Toggle mute
  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  // Handle likes
  const toggleLike = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };
  
  // Double tap to like
  const handleDoubleTap = () => {
    const now = new Date().getTime();
    const timeSince = now - lastTap.current;
    
    if (timeSince < 300 && timeSince > 0) {
      const currentVideo = VIDEOS[currentVideoIndex];
      if (currentVideo) {
        setLikedVideos(prev => ({
          ...prev,
          [currentVideo.id]: true
        }));
      }
    }
    
    lastTap.current = now;
  };
  
  // Handle video playback
  useEffect(() => {
    if (!isClient || containerHeight === 0) return;
    
    // Determine which video is most visible
    const normalizedTranslate = -translateY;
    const visibleIndex = Math.round(normalizedTranslate / containerHeight);
    
    if (visibleIndex >= 0 && visibleIndex < VIDEOS.length && visibleIndex !== currentVideoIndex) {
      setCurrentVideoIndex(visibleIndex);
    }
    
    // Pause all videos first
    Object.values(videoRefs.current).forEach(videoRef => {
      if (videoRef && !videoRef.paused) {
        videoRef.pause();
      }
    });
    
    // Only play the video if it's more than 50% visible
    const visiblePct = 1 - Math.abs((normalizedTranslate % containerHeight) / containerHeight);
    if (visiblePct > 0.5) {
      const currentVideo = videoRefs.current[VIDEOS[visibleIndex]?.id];
      if (currentVideo) {
        currentVideo.currentTime = 0;
        const playPromise = currentVideo.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            console.log("Autoplay prevented, waiting for user interaction");
          });
        }
      }
    }
  }, [translateY, containerHeight, isClient, currentVideoIndex]);
  
  // Snap to nearest video with animation
  const snapToNearestVideo = () => {
    // Only snap if we should (not during continuous scroll or drag)
    if (!shouldSnapToVideo.current) return;
    
    // Calculate which video to snap to
    const normalizedTranslate = -translateY;
    const nearestIndex = Math.round(normalizedTranslate / containerHeight);
    const targetIndex = Math.max(0, Math.min(VIDEOS.length - 1, nearestIndex));
    const targetTranslate = -targetIndex * containerHeight;
    
    // Don't animate if we're already very close
    if (Math.abs(translateY - targetTranslate) < 5) {
      setTranslateY(targetTranslate);
      return;
    }
    
    // Animate to target position
    const startPosition = translateY;
    const distance = targetTranslate - startPosition;
    const startTime = performance.now();
    const duration = 300; // ms
    
    const animateSnap = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      setTranslateY(startPosition + distance * easedProgress);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateSnap);
      } else {
        animationRef.current = null;
      }
    };
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Start animation
    animationRef.current = requestAnimationFrame(animateSnap);
  };
  
  // Apply momentum scrolling
  const applyMomentum = () => {
    // Calculate velocity based on recent movements
    if (lastVelocity.current.length > 0) {
      // Average recent velocities
      velocity.current = lastVelocity.current.reduce((a, b) => a + b, 0) / lastVelocity.current.length;
    }
    
    // Don't continue if velocity is very low
    if (Math.abs(velocity.current) < 0.5) {
      velocity.current = 0;
      lastVelocity.current = [];
      
      // Snap to nearest video
      snapToNearestVideo();
      return;
    }
    
    // Apply deceleration
    velocity.current *= 0.95;
    
    // Update position
    const newTranslate = translateY + velocity.current;
    
    // Apply boundaries with rubber band effect
    const maxTranslate = 0;
    const minTranslate = -(VIDEOS.length - 1) * containerHeight;
    
    let finalTranslate = newTranslate;
    
    if (newTranslate > maxTranslate) {
      // Rubber band at top
      finalTranslate = maxTranslate + (newTranslate - maxTranslate) * 0.2;
      velocity.current *= 0.8;
    } else if (newTranslate < minTranslate) {
      // Rubber band at bottom
      finalTranslate = minTranslate + (newTranslate - minTranslate) * 0.2;
      velocity.current *= 0.8;
    }
    
    setTranslateY(finalTranslate);
    
    // Continue momentum scrolling
    animationRef.current = requestAnimationFrame(applyMomentum);
  };
  
  // Enhanced wheel event handler that differentiates between mouse wheel and trackpad
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Calculate current time
    const now = performance.now();
    const dt = now - lastTimestamp.current;
    lastTimestamp.current = now;
    
    // Detect if this is likely a trackpad (smooth, small deltas)
    // or mouse wheel (chunky, large deltas)
    const isTrackpad = Math.abs(e.deltaY) < 40 && e.deltaMode === 0;
    
    if (isTrackpad) {
      wheelType.current = 'trackpad';
      
      // For trackpad, directly update position
      const newTranslate = translateY - e.deltaY;
      
      // Calculate velocity for momentum
      if (dt > 0) {
        const instantVelocity = -e.deltaY / dt * 15; // Scale to make it feel right
        lastVelocity.current.push(instantVelocity);
        
        // Keep only recent velocities
        if (lastVelocity.current.length > 5) {
          lastVelocity.current.shift();
        }
      }
      
      // Apply boundaries with rubber band effect
      const maxTranslate = 0;
      const minTranslate = -(VIDEOS.length - 1) * containerHeight;
      
      let finalTranslate = newTranslate;
      
      if (newTranslate > maxTranslate) {
        // Rubber band at top
        finalTranslate = maxTranslate + (newTranslate - maxTranslate) * 0.2;
      } else if (newTranslate < minTranslate) {
        // Rubber band at bottom
        finalTranslate = minTranslate + (newTranslate - minTranslate) * 0.2;
      }
      
      setTranslateY(finalTranslate);
      
      // Clear any existing timeout
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
        wheelTimeout.current = null;
      }
      
      // Set a timeout to apply momentum when scrolling stops
      wheelTimeout.current = setTimeout(() => {
        shouldSnapToVideo.current = true;
        animationRef.current = requestAnimationFrame(applyMomentum);
      }, 100);
      
    } else {
      // For mouse wheel, do discrete navigation
      wheelType.current = 'mouse';
      
      // Accumulate in case of small mouse wheel deltas
      wheelAccumulator.current += e.deltaY;
      
      if (Math.abs(wheelAccumulator.current) >= 50) {
        // Calculate target index based on direction
        const direction = wheelAccumulator.current > 0 ? 1 : -1;
        const targetIndex = Math.max(0, Math.min(VIDEOS.length - 1, currentVideoIndex + direction));
        
        // Reset accumulator
        wheelAccumulator.current = 0;
        
        // If we're already at the edge, don't do anything
        if (targetIndex === currentVideoIndex) return;
        
        // Animate to target video
        const targetTranslate = -targetIndex * containerHeight;
        
        // Simple animation
        const startPosition = translateY;
        const distance = targetTranslate - startPosition;
        const startTime = performance.now();
        const duration = 300; // ms
        
        const animateWheel = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Ease out cubic
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          
          setTranslateY(startPosition + distance * easedProgress);
          
          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animateWheel);
          } else {
            animationRef.current = null;
            setCurrentVideoIndex(targetIndex);
          }
        };
        
        // Start animation
        animationRef.current = requestAnimationFrame(animateWheel);
      }
    }
  };
  
  // Mouse/touch event handlers for direct manipulation
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only handle primary button or touch
    if (e.pointerType !== 'touch' && e.button !== 0) return;
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    isDragging.current = true;
    startY.current = e.clientY;
    lastY.current = e.clientY;
    lastTimestamp.current = performance.now();
    velocity.current = 0;
    lastVelocity.current = [];
    shouldSnapToVideo.current = false;
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || startY.current === null) return;
    
    const currentY = e.clientY;
    const deltaY = lastY.current - currentY;
    
    // Calculate instantaneous velocity
    const now = performance.now();
    const dt = now - lastTimestamp.current;
    
    if (dt > 0) {
      const instantVelocity = deltaY / dt * 15; // Scale to make it feel right
      lastVelocity.current.push(instantVelocity);
      
      // Keep only recent velocities
      if (lastVelocity.current.length > 5) {
        lastVelocity.current.shift();
      }
    }
    
    // Update position
    const newTranslate = translateY + deltaY;
    
    // Apply boundaries with rubber band effect
    const maxTranslate = 0;
    const minTranslate = -(VIDEOS.length - 1) * containerHeight;
    
    let finalTranslate = newTranslate;
    
    if (newTranslate > maxTranslate) {
      // Rubber band at top
      finalTranslate = maxTranslate + (newTranslate - maxTranslate) * 0.2;
    } else if (newTranslate < minTranslate) {
      // Rubber band at bottom
      finalTranslate = minTranslate + (newTranslate - minTranslate) * 0.2;
    }
    
    setTranslateY(finalTranslate);
    
    lastY.current = currentY;
    lastTimestamp.current = now;
  };
  
  const handlePointerUp = () => {
    if (!isDragging.current) return;
    
    isDragging.current = false;
    startY.current = null;
    shouldSnapToVideo.current = true;
    
    // Apply momentum scrolling
    animationRef.current = requestAnimationFrame(applyMomentum);
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        // Move to next video
        const targetIndex = Math.min(VIDEOS.length - 1, currentVideoIndex + 1);
        const targetTranslate = -targetIndex * containerHeight;
        
        // Animate to target
        const startPosition = translateY;
        const distance = targetTranslate - startPosition;
        const startTime = performance.now();
        const duration = 300; // ms
        
        const animateKey = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Ease out cubic
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          
          setTranslateY(startPosition + distance * easedProgress);
          
          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animateKey);
          } else {
            animationRef.current = null;
            setCurrentVideoIndex(targetIndex);
          }
        };
        
        // Cancel any ongoing animation
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        // Start animation
        animationRef.current = requestAnimationFrame(animateKey);
        
      } else if (e.key === 'ArrowUp') {
        // Move to previous video
        const targetIndex = Math.max(0, currentVideoIndex - 1);
        const targetTranslate = -targetIndex * containerHeight;
        
        // Animate to target
        const startPosition = translateY;
        const distance = targetTranslate - startPosition;
        const startTime = performance.now();
        const duration = 300; // ms
        
        const animateKey = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Ease out cubic
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          
          setTranslateY(startPosition + distance * easedProgress);
          
          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animateKey);
          } else {
            animationRef.current = null;
            setCurrentVideoIndex(targetIndex);
          }
        };
        
        // Cancel any ongoing animation
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        // Start animation
        animationRef.current = requestAnimationFrame(animateKey);
        
      } else if (e.key === 'm') {
        toggleMute();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, containerHeight, translateY]);
  
  // Loading state
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return (
    <div 
      className="h-screen w-full overflow-hidden bg-black relative"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleDoubleTap}
      style={{ touchAction: 'none' }} // Prevent browser handling of touch gestures
    >
      {/* Main video container */}
      <div className="w-full h-full flex justify-center items-center">
        <div 
          className="relative"
          style={{ 
            width: containerWidth,
            height: containerHeight
          }}
        >
          {/* Videos container */}
          <div 
            className="absolute w-full transition-none"
            style={{ 
              height: containerHeight * VIDEOS.length,
              transform: `translateY(${translateY}px)`,
              willChange: 'transform' // Performance optimization
            }}
          >
            {VIDEOS.map((video, index) => {
              // Only render videos that are potentially visible
              const distanceFromVisible = Math.abs((translateY / containerHeight) + index);
              const isVisible = distanceFromVisible < 2;
              
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
                      {/* Video element */}
                      <video
                        ref={(el) => { if (el) videoRefs.current[video.id] = el; }}
                        src={video.url}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        loop
                        playsInline
                        muted={isMuted}
                        preload="auto"
                        controls={false}
                      />
                      
                      {/* Video info overlay */}
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-white/30">
                            <img 
                              src={`https://randomuser.me/api/portraits/men/${index + 1}.jpg`}
                              alt={video.username} 
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = 'https://placehold.co/100/gray/white?text=User';
                              }}
                            />
                          </div>
        </div>
      </div>
      
      {/* Sound toggle button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          toggleMute(e);
        }}
        className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 rounded-full p-2 z-30 transition-colors"
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* Video counter indicator */}
      <div className="absolute top-4 left-4 bg-black/30 rounded-full px-3 py-1 z-30">
        <span className="text-white text-sm">{currentVideoIndex + 1} / {VIDEOS.length}</span>
      </div>
      
      {/* Progress dots - show progress between videos */}
      <div className="absolute top-14 left-0 right-0 flex justify-center z-30">
        <div className="flex space-x-1">
          {VIDEOS.map((_, index) => {
            // Calculate how close we are to this video
            const normalizedPosition = -translateY / containerHeight;
            const distanceFromIndex = Math.abs(normalizedPosition - index);
            const isActive = distanceFromIndex < 1;
            const isCurrent = index === currentVideoIndex;
            
            return (
              <div 
                key={index}
                className={`rounded-full h-1.5 ${
                  isActive 
                    ? isCurrent 
                      ? 'w-4 bg-white' 
                      : 'w-3 bg-white/80'
                    : 'w-1.5 bg-white/50'
                } transition-all duration-200`}
              />
            );
          })}
        </div>
      </div>
      
      {/* Scroll guide indicator */}
      {VIDEOS.length > 1 && currentVideoIndex === 0 && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/30 px-3 py-1 rounded-full z-30 flex items-center">
          <span className="mr-2">Swipe up for more</span>
          <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default FeedList;
                          <div>
                            <p className="font-bold text-white flex items-center">
                              @{video.username}
                              <span className="inline-flex ml-2 items-center justify-center rounded-full bg-tiktok-pink/30 px-2 py-0.5 text-xs text-white">
                                Follow
                              </span>
                            </p>
                            <p className="text-white text-xs opacity-80">{video.song}</p>
                          </div>
                        </div>
                        <p className="text-white text-sm mb-4 max-w-[80%]">{video.caption}</p>
                      </div>
                      
                      {/* Side actions */}
                      <div className="absolute right-3 bottom-20 flex flex-col items-center space-y-5">
                        <button 
                          className="flex flex-col items-center"
                          onClick={(e) => toggleLike(video.id, e)}
                        >
                          <div className="rounded-full bg-black/20 p-2">
                            <svg 
                              className={`h-8 w-8 ${likedVideos[video.id] ? 'text-red-500' : 'text-white'}`} 
                              fill={likedVideos[video.id] ? "currentColor" : "none"} 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                          <span className="text-white text-xs mt-1">{formatCount(video.likes)}</span>
                        </button>
                        
                        <button className="flex flex-col items-center">
                          <div className="rounded-full bg-black/20 p-2">
                            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <span className="text-white text-xs mt-1">{formatCount(video.comments)}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
