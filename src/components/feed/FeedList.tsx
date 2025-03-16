"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

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
  
  // Window height for proper sizing
  const [containerHeight, setContainerHeight] = useState<number>(0);
  
  // Direct tactile control over offset position
  const [offset, setOffset] = useState<number>(0);
  
  // Animation control
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  // Wheel and touch tracking
  const wheelTimer = useRef<any>(null);
  const touchStartY = useRef<number>(0);
  const lastTap = useRef<number>(0);
  const lastWheelEvent = useRef<number>(0);
  const isMouseWheelRef = useRef<boolean>(false);
  
  // Video element references
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Handle when scrolling stops
  const handleScrollEnd = useCallback(() => {
    if (isAnimating) return;
    
    // Decision about whether to navigate or snap back - uses 50% threshold
    if (Math.abs(offset) > containerHeight * 0.5) {
      setIsAnimating(true);
      
      // Direction determines which way to navigate
      if (offset < 0 && currentVideoIndex < VIDEOS.length - 1) {
        // Scrolled down - go to next
        setCurrentVideoIndex(prev => prev + 1);
      } else if (offset > 0 && currentVideoIndex > 0) {
        // Scrolled up - go to previous
        setCurrentVideoIndex(prev => prev - 1);
      }
      
      // Reset offset after navigation
      setOffset(0);
      
      // Unlock after animation
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    } else {
      // Not enough to navigate - snap back to current
      setIsAnimating(true);
      setOffset(0);
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  }, [offset, isAnimating, currentVideoIndex, VIDEOS.length, containerHeight]);
  
  // Set video ref
  const setVideoRef = useCallback((id: string, el: HTMLVideoElement | null) => {
    if (id) {
      videoRefs.current[id] = el;
    }
  }, []);
  
  // Toggle mute function
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  // Double tap to like
  const handleDoubleTap = useCallback(() => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap.current;
    
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      const currentVideoId = VIDEOS[currentVideoIndex]?.id;
      if (currentVideoId) {
        // Update like status
        setLikedVideos(prev => ({
          ...prev,
          [currentVideoId]: true
        }));
      }
    }
    
    lastTap.current = currentTime;
  }, [currentVideoIndex]);
  
  // Toggle like directly
  const toggleLike = useCallback((videoId: string) => {
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  }, []);
  
  // IMPROVED: Wheel event handling with better detection of mouse wheel vs trackpad
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (isAnimating) return;
    
    const now = Date.now();
    const timeDelta = now - lastWheelEvent.current;
    lastWheelEvent.current = now;
    
    // Detect if it's a discrete mouse wheel or continuous trackpad
    // Mouse wheels typically have larger deltaY and deltaMode of 1 or 3
    // Also, mouse wheel events come with bigger time gaps
    const isMouseWheel = (
      Math.abs(e.deltaY) > 100 || 
      e.deltaMode !== 0 || 
      timeDelta > 100
    );
    
    // Store for later reference
    isMouseWheelRef.current = isMouseWheel;
    
    // Immediate navigation for mouse wheel
    if (isMouseWheel) {
      if (e.deltaY > 0 && currentVideoIndex < VIDEOS.length - 1) {
        setIsAnimating(true);
        setCurrentVideoIndex(prev => prev + 1);
        setOffset(0);
        setTimeout(() => setIsAnimating(false), 300);
      } else if (e.deltaY < 0 && currentVideoIndex > 0) {
        setIsAnimating(true);
        setCurrentVideoIndex(prev => prev - 1);
        setOffset(0);
        setTimeout(() => setIsAnimating(false), 300);
      }
      return;
    }
    
    // For trackpad: direct tactile control
    // DeltaY is negative when scrolling up, positive when scrolling down
    // For natural feel, we reverse this (negative offset = down, positive = up)
    const delta = -e.deltaY;
    const sensitivity = 2.5; // Balanced sensitivity
    
    // Update offset directly - this creates the tactile feel
    setOffset(currentOffset => {
      // Calculate new position with sensitivity applied
      let newOffset = currentOffset + (delta * sensitivity);
      
      // Apply resistance at the edges
      if ((currentVideoIndex === 0 && newOffset > 0) || 
          (currentVideoIndex === VIDEOS.length - 1 && newOffset < 0)) {
        newOffset = currentOffset + (delta * sensitivity * 0.2); // Strong resistance
      }
      
      // Limit maximum offset for stability
      const maxOffset = containerHeight * 0.8;
      return Math.max(Math.min(newOffset, maxOffset), -maxOffset);
    });
    
    // Clear existing debounce timer
    if (wheelTimer.current) {
      clearTimeout(wheelTimer.current);
    }
    
    // Set timer to detect when scrolling stops
    wheelTimer.current = setTimeout(() => {
      handleScrollEnd();
      wheelTimer.current = null;
    }, 150);
  }, [
    isAnimating,
    currentVideoIndex, 
    VIDEOS.length, 
    containerHeight, 
    handleScrollEnd
  ]);
  
  // Handle touch events for touch screens
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (isAnimating) return;
    touchStartY.current = e.touches[0].clientY;
  }, [isAnimating]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (isAnimating) return;
    
    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY.current;
    
    // Direct mapping for natural feel
    setOffset(currentOffset => {
      // Natural feel - move with finger
      let newOffset = diff;
      
      // Edge resistance
      if ((currentVideoIndex === 0 && newOffset > 0) || 
          (currentVideoIndex === VIDEOS.length - 1 && newOffset < 0)) {
        newOffset = diff * 0.2; // Strong resistance at edges
      }
      
      // Safety limits
      const maxOffset = containerHeight * 0.8;
      return Math.max(Math.min(newOffset, maxOffset), -maxOffset);
    });
  }, [isAnimating, currentVideoIndex, VIDEOS.length, containerHeight]);
  
  const handleTouchEnd = useCallback(() => {
    if (isAnimating) return;
    handleScrollEnd();
  }, [isAnimating, handleScrollEnd]);
  
  // Setup window events
  useEffect(() => {
    setIsClient(true);
    
    // Set window height
    const updateHeight = (): void => {
      setContainerHeight(window.innerHeight);
    };
    
    // Initialize height
    updateHeight();
    
    // Listen for resize
    window.addEventListener('resize', updateHeight);
    
    // Add keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;
      
      if (e.key === 'ArrowUp') {
        if (currentVideoIndex > 0) {
          setIsAnimating(true);
          setCurrentVideoIndex(prev => prev - 1);
          setOffset(0);
          setTimeout(() => setIsAnimating(false), 300);
        }
      } else if (e.key === 'ArrowDown') {
        if (currentVideoIndex < VIDEOS.length - 1) {
          setIsAnimating(true);
          setCurrentVideoIndex(prev => prev + 1);
          setOffset(0);
          setTimeout(() => setIsAnimating(false), 300);
        }
      } else if (e.key === 'm') {
        setIsMuted(!isMuted);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Safety measure - if somehow we get stuck, force snap back
    const safetyInterval = setInterval(() => {
      if (!isAnimating && Math.abs(offset) > 0 && wheelTimer.current === null) {
        setOffset(0);
      }
    }, 1000);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(safetyInterval);
      if (wheelTimer.current) {
        clearTimeout(wheelTimer.current);
      }
    };
  }, [currentVideoIndex, isAnimating, isMuted, offset, VIDEOS.length]);
  
  // Handle video playback when current index changes
  useEffect(() => {
    if (!isClient) return;
    
    // Pause all videos
    Object.values(videoRefs.current).forEach(videoRef => {
      if (videoRef && !videoRef.paused) {
        try {
          videoRef.pause();
        } catch (error) {
          console.error("Error pausing video:", error);
        }
      }
    });
    
    // Get current video
    const currentVideo = videoRefs.current[VIDEOS[currentVideoIndex]?.id];
    if (currentVideo) {
      // Reset to beginning
      currentVideo.currentTime = 0;
      
      // Attempt to play with error handling
      const playPromise = currentVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Auto-play prevented, waiting for user interaction");
          
          // Add a one-time click event listener to play the video
          const playOnInteraction = () => {
            currentVideo.play().catch(e => console.error("Play still failed:", e));
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          };
          
          document.addEventListener('click', playOnInteraction, { once: true });
          document.addEventListener('touchstart', playOnInteraction, { once: true });
        });
      }
    }
  }, [currentVideoIndex, isClient]);
  
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
      ref={containerRef}
      className="h-screen w-full overflow-hidden bg-black relative px-1"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleDoubleTap}
    >
      {/* Main feed container with direct control */}
      <motion.div 
        className="absolute w-full px-2"
        style={{ height: containerHeight * VIDEOS.length }}
        animate={{ 
          y: -currentVideoIndex * containerHeight + offset
        }}
        transition={isAnimating ? {
          // For navigation animations - quick and smooth
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.3
        } : {
          // For direct tactile control - immediate response
          type: "tween", 
          duration: 0,
          ease: "linear"
        }}
      >
        {VIDEOS.map((videoItem, index) => {
          // Only render videos that are close to the current one for performance
          const isVisible = Math.abs(index - currentVideoIndex) <= 1;
          
          return (
            <div 
              key={videoItem.id} 
              className="absolute w-full"
              style={{ 
                height: containerHeight,
                top: index * containerHeight,
                paddingBottom: "16px", // Add spacing between videos
              }}
            >
              {isVisible && (
                <div className="relative w-full h-full overflow-hidden px-2 py-2 flex justify-center">
                  {/* Video container with strict 9:16 aspect ratio */}
                  <div 
                    className="relative video-container rounded-2xl overflow-hidden"
                    style={{ 
                      width: "100%", 
                      maxWidth: `${containerHeight * 9 / 16}px`, // Proper 9:16 aspect ratio
                      height: "100%"
                    }}
                  >
                    {/* Video element */}
                    <video
                      ref={(el) => setVideoRef(videoItem.id, el)}
                      src={videoItem.url}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      loop
                      playsInline
                      muted={isMuted}
                      preload="auto"
                      controls={false}
                    />
                    
                    {/* Video info overlay */}
                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent" style={{ zIndex: 10 }}>
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-white/30">
                          <img 
                            src={`https://randomuser.me/api/portraits/men/${index + 1}.jpg`}
                            alt={videoItem.username} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'https://placehold.co/100/gray/white?text=User';
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center">
                            @{videoItem.username}
                            <span className="inline-flex ml-2 items-center justify-center rounded-full bg-tiktok-pink/30 px-2 py-0.5 text-xs text-white">
                              Follow
                            </span>
                          </p>
                          <p className="text-white text-xs opacity-80">{videoItem.song}</p>
                        </div>
                      </div>
                      <p className="text-white text-sm mb-4 max-w-[80%]">{videoItem.caption}</p>
                    </div>
                    
                    {/* Side actions */}
                    <div className="absolute right-3 bottom-20 flex flex-col items-center space-y-5" style={{ zIndex: 20 }}>
                      <button 
                        className="flex flex-col items-center"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          toggleLike(videoItem.id);
                        }}
                      >
                        <div className="rounded-full bg-black/20 p-2">
                          <svg 
                            className={`h-8 w-8 ${likedVideos[videoItem.id] ? 'text-red-500' : 'text-white'}`} 
                            fill={likedVideos[videoItem.id] ? "currentColor" : "none"} 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <span className="text-white text-xs mt-1">{formatCount(videoItem.likes)}</span>
                      </button>
                      
                      <button className="flex flex-col items-center">
                        <div className="rounded-full bg-black/20 p-2">
                          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <span className="text-white text-xs mt-1">{formatCount(videoItem.comments)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>
      
      {/* Sound toggle button */}
      <button 
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          toggleMute();
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
