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

function FeedList(): JSX.Element {
  // Client-side rendering detection
  const [isClient, setIsClient] = useState<boolean>(false);
  
  // Current active video
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  
  // Track likes
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  
  // Video playing state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Container height
  const [containerHeight, setContainerHeight] = useState<number>(0);
  
  // For tactile scrolling
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const wheelLock = useRef<boolean>(false);
  const rafId = useRef<number | null>(null);
  const scrollVelocity = useRef<number>(0);
  const lastTap = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);
  const prevTouchY = useRef<number | null>(null);
  
  // Set up client-side detection
  useEffect(() => {
    setIsClient(true);
    updateDimensions();
    
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);
  
  // Update container dimensions
  const updateDimensions = () => {
    const height = window.innerHeight;
    setContainerHeight(height);
    
    // Reset scroll position to current video
    setScrollPosition(-currentVideoIndex * height);
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
  
  // Manage video playback
  useEffect(() => {
    if (!isClient) return;
    
    const activeIndex = Math.round(Math.abs(scrollPosition) / containerHeight);
    if (activeIndex < 0 || activeIndex >= VIDEOS.length) return;
    
    // Pause all videos first
    Object.values(videoRefs.current).forEach(videoRef => {
      if (videoRef && !videoRef.paused) {
        videoRef.pause();
      }
    });
    
    // Play current video
    const currentVideo = videoRefs.current[VIDEOS[activeIndex]?.id];
    if (currentVideo) {
      const playPromise = currentVideo.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.log("Autoplay prevented, waiting for user interaction");
        });
      }
    }
    
    setCurrentVideoIndex(activeIndex);
  }, [isClient, scrollPosition, containerHeight]);
  
  // Apply momentum scrolling
  const applyMomentum = () => {
    // Apply deceleration
    scrollVelocity.current *= 0.95;
    
    // Update position with velocity
    const newPosition = scrollPosition + scrollVelocity.current;
    
    // Apply boundaries with rubber band effect
    const maxScroll = 0;
    const minScroll = -(VIDEOS.length - 1) * containerHeight;
    
    let finalPosition = newPosition;
    
    // Check if we need to snap to a video
    if (Math.abs(scrollVelocity.current) < 2) {
      scrollVelocity.current = 0;
      
      // Snap to nearest video
      const nearestIndex = Math.round(Math.abs(newPosition) / containerHeight);
      finalPosition = -nearestIndex * containerHeight;
      
      setScrollPosition(finalPosition);
      setIsScrolling(false);
      return;
    }
    
    // Apply rubber band effect at boundaries
    if (newPosition > maxScroll) {
      finalPosition = maxScroll + (newPosition - maxScroll) * 0.2;
      scrollVelocity.current *= 0.8;
    } else if (newPosition < minScroll) {
      finalPosition = minScroll + (newPosition - minScroll) * 0.2;
      scrollVelocity.current *= 0.8;
    }
    
    setScrollPosition(finalPosition);
    
    // Continue animation if still moving
    if (Math.abs(scrollVelocity.current) > 0.1) {
      rafId.current = requestAnimationFrame(applyMomentum);
    } else {
      setIsScrolling(false);
    }
  };
  
  // Handle wheel events for both mouse and trackpad
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Detect if this is likely a trackpad (small deltas) or mouse wheel (larger deltas)
    const isTrackpad = Math.abs(e.deltaY) < 40;
    
    if (isTrackpad) {
      // Cancel any existing animation
      if (rafId.current) cancelAnimationFrame(rafId.current);
      
      // Update scroll position directly for trackpad
      const newPosition = scrollPosition - e.deltaY * 1.2;
      
      // Apply boundaries with rubber band effect
      const maxScroll = 0;
      const minScroll = -(VIDEOS.length - 1) * containerHeight;
      
      let finalPosition = newPosition;
      
      if (newPosition > maxScroll) {
        finalPosition = maxScroll + (newPosition - maxScroll) * 0.2;
      } else if (newPosition < minScroll) {
        finalPosition = minScroll + (newPosition - minScroll) * 0.2;
      }
      
      setScrollPosition(finalPosition);
      
      // Track velocity for momentum scrolling
      scrollVelocity.current = -e.deltaY * 0.8;
      setIsScrolling(true);
      
      // Start momentum scrolling animation after a short delay
      setTimeout(() => {
        if (isScrolling) rafId.current = requestAnimationFrame(applyMomentum);
      }, 50);
    } else {
      // For mouse wheel - discrete navigation
      if (wheelLock.current) return;
      
      wheelLock.current = true;
      
      // Calculate next index
      const nextIndex = e.deltaY > 0 
        ? Math.min(VIDEOS.length - 1, currentVideoIndex + 1)
        : Math.max(0, currentVideoIndex - 1);
      
      // Animate to next video
      setIsScrolling(true);
      const targetPosition = -nextIndex * containerHeight;
      
      // Simple animation
      const startPosition = scrollPosition;
      const distance = targetPosition - startPosition;
      const duration = 300; // ms
      const startTime = performance.now();
      
      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        setScrollPosition(startPosition + distance * easeProgress);
        
        if (progress < 1) {
          rafId.current = requestAnimationFrame(animateScroll);
        } else {
          setIsScrolling(false);
          wheelLock.current = false;
        }
      };
      
      rafId.current = requestAnimationFrame(animateScroll);
    }
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
  
  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    
    touchStartY.current = e.touches[0].clientY;
    prevTouchY.current = e.touches[0].clientY;
    scrollVelocity.current = 0;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null || prevTouchY.current === null) return;
    
    const touchY = e.touches[0].clientY;
    const deltaY = prevTouchY.current - touchY;
    
    // Update velocity for momentum scrolling
    scrollVelocity.current = -deltaY * 0.8;
    
    // Update position
    const newPosition = scrollPosition - deltaY;
    
    // Apply boundaries with rubber band effect
    const maxScroll = 0;
    const minScroll = -(VIDEOS.length - 1) * containerHeight;
    
    let finalPosition = newPosition;
    
    if (newPosition > maxScroll) {
      finalPosition = maxScroll + (newPosition - maxScroll) * 0.2;
    } else if (newPosition < minScroll) {
      finalPosition = minScroll + (newPosition - minScroll) * 0.2;
    }
    
    setScrollPosition(finalPosition);
    setIsScrolling(true);
    
    prevTouchY.current = touchY;
  };
  
  const handleTouchEnd = () => {
    if (touchStartY.current === null) return;
    
    // Apply momentum scrolling
    rafId.current = requestAnimationFrame(applyMomentum);
    
    touchStartY.current = null;
    prevTouchY.current = null;
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        const nextIndex = Math.min(VIDEOS.length - 1, currentVideoIndex + 1);
        setIsScrolling(true);
        const targetPosition = -nextIndex * containerHeight;
        setScrollPosition(targetPosition);
      } else if (e.key === 'ArrowUp') {
        const prevIndex = Math.max(0, currentVideoIndex - 1);
        setIsScrolling(true);
        const targetPosition = -prevIndex * containerHeight;
        setScrollPosition(targetPosition);
      } else if (e.key === 'm') {
        toggleMute();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, containerHeight]);
  
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
      className="h-screen w-full overflow-hidden bg-black relative"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleDoubleTap}
    >
      {/* Viewport container */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        {/* Videos container with transform */}
        <div 
          className="absolute w-full transition-none"
          style={{ 
            height: containerHeight * VIDEOS.length,
            transform: `translateY(${scrollPosition}px)`,
          }}
        >
          {VIDEOS.map((video, index) => {
            // Only render videos that are close to current
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
                  <div className="relative w-full h-full">
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
      </div>
      
      {/* Sound toggle button */}
      <button 
        onClick={(e) => toggleMute(e)}
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
      
      {/* Progress dots */}
      <div className="absolute top-14 left-0 right-0 flex justify-center z-30">
        <div className="flex space-x-1">
          {VIDEOS.map((_, index) => {
            // Calculate how close we are to this video
            const scrollProgress = Math.abs(scrollPosition) / containerHeight;
            const distanceFromIndex = Math.abs(scrollProgress - index);
            const isActive = distanceFromIndex < 1;
            
            return (
              <div 
                key={index}
                className={`rounded-full h-1.5 ${
                  isActive 
                    ? index === currentVideoIndex 
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
