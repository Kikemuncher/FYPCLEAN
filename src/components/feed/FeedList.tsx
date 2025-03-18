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
  // Current active video
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  
  // Track likes
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  
  // Video playing state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true); // Start paused
  
  // Container height
  const [containerHeight, setContainerHeight] = useState<number>(0);
  
  // Actual scroll position
  const [scrollY, setScrollY] = useState<number>(0);
  
  // Animation frame ID for smooth scrolling
  const animationFrameId = useRef<number | null>(null);
  
  // Video element references
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const videoTimeRefs = useRef<Record<string, number>>({});
  
  // Touch tracking
  const touchStartY = useRef<number | null>(null);
  const touchDeltaY = useRef<number>(0);
  
  // Scroll tracking (for smooth scrolling)
  const targetScrollY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const lastScrollTime = useRef<number>(0);
  const isSnapAnimating = useRef<boolean>(false);
  
  // Last tap for double tap detection
  const lastTap = useRef<number>(0);
  
  // Set up container height and initial scroll position
  useEffect(() => {
    setContainerHeight(window.innerHeight);
    
    const updateHeight = () => {
      setContainerHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);
  
  // Toggle mute
  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  // Toggle play/pause - Save and restore position
  const togglePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const videoId = VIDEOS[currentVideoIndex]?.id;
    const currentVideo = videoRefs.current[videoId];
    
    if (currentVideo) {
      if (currentVideo.paused) {
        // If we have a saved position, restore it
        if (videoTimeRefs.current[videoId] !== undefined) {
          currentVideo.currentTime = videoTimeRefs.current[videoId];
        }
        currentVideo.play();
        setIsPaused(false);
      } else {
        // Save the current position before pausing
        videoTimeRefs.current[videoId] = currentVideo.currentTime;
        currentVideo.pause();
        setIsPaused(true);
      }
    }
  };
  
  // Handle likes
  const toggleLike = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };
  
  // Handle video playback when switching videos
  useEffect(() => {
    // Pause all videos and save their positions
    Object.entries(videoRefs.current).forEach(([id, videoRef]) => {
      if (videoRef && !videoRef.paused) {
        videoTimeRefs.current[id] = videoRef.currentTime;
        videoRef.pause();
      }
    });
    
    // Play current video if not paused
    const videoId = VIDEOS[currentVideoIndex]?.id;
    const currentVideo = videoRefs.current[videoId];
    
    if (currentVideo) {
      // Always start from beginning when switching videos
      currentVideo.currentTime = 0;
      
      if (!isPaused) {
        const playPromise = currentVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            console.log("Autoplay prevented, waiting for user interaction");
            setIsPaused(true);
          });
        }
      }
    }
    
    // Update the target scroll position to match the current video
    targetScrollY.current = currentVideoIndex * containerHeight;
    setScrollY(targetScrollY.current);
  }, [currentVideoIndex, containerHeight]);
  
  // Smooth scrolling animation using requestAnimationFrame
  const animateScroll = () => {
    const currentPosition = scrollY;
    const targetPosition = targetScrollY.current;
    
    // If we're at the target or animation was canceled, stop
    if (Math.abs(currentPosition - targetPosition) < 1 || isSnapAnimating.current === false) {
      setScrollY(targetPosition);
      isSnapAnimating.current = false;
      return;
    }
    
    // Logarithmic easing for smooth deceleration
    const distance = targetPosition - currentPosition;
    const speed = distance * 0.15; // Adjust this value to control animation speed
    
    // Update the scroll position
    setScrollY(currentPosition + speed);
    
    // Continue the animation
    animationFrameId.current = requestAnimationFrame(animateScroll);
  };
  
  // Go to next video if possible
  const goToNextVideo = () => {
    if (isSnapAnimating.current) return; // Prevent multiple navigations
    
    if (currentVideoIndex < VIDEOS.length - 1) {
      // Start the snap animation
      isSnapAnimating.current = true;
      targetScrollY.current = (currentVideoIndex + 1) * containerHeight;
      
      // Set the current index
      setCurrentVideoIndex(currentVideoIndex + 1);
      
      // Start the animation
      animationFrameId.current = requestAnimationFrame(animateScroll);
    } else {
      // Snap back to current video with animation
      isSnapAnimating.current = true;
      targetScrollY.current = currentVideoIndex * containerHeight;
      animationFrameId.current = requestAnimationFrame(animateScroll);
    }
  };
  
  // Go to previous video if possible
  const goToPrevVideo = () => {
    if (isSnapAnimating.current) return; // Prevent multiple navigations
    
    if (currentVideoIndex > 0) {
      // Start the snap animation
      isSnapAnimating.current = true;
      targetScrollY.current = (currentVideoIndex - 1) * containerHeight;
      
      // Set the current index
      setCurrentVideoIndex(currentVideoIndex - 1);
      
      // Start the animation
      animationFrameId.current = requestAnimationFrame(animateScroll);
    } else {
      // Snap back to current video with animation
      isSnapAnimating.current = true;
      targetScrollY.current = currentVideoIndex * containerHeight;
      animationFrameId.current = requestAnimationFrame(animateScroll);
    }
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
  
  // Simple and reliable wheel handler that directly affects scroll position
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (isSnapAnimating.current) {
      // If currently animating, cancel it and update to current position
      isSnapAnimating.current = false;
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    }
    
    // Direct scroll control
    const direction = e.deltaY > 0 ? 'down' : 'up';
    
    // Update the scroll position directly
    const newScrollY = scrollY + e.deltaY;
    
    // Check boundaries
    const minScrollY = 0;
    const maxScrollY = (VIDEOS.length - 1) * containerHeight;
    
    let finalScrollY = newScrollY;
    
    // Apply elastic effect at boundaries
    if (newScrollY < minScrollY) {
      // Elastic pull at top
      const overscroll = minScrollY - newScrollY;
      finalScrollY = minScrollY - (overscroll * 0.2); // 20% elasticity
    } else if (newScrollY > maxScrollY) {
      // Elastic pull at bottom
      const overscroll = newScrollY - maxScrollY;
      finalScrollY = maxScrollY + (overscroll * 0.2); // 20% elasticity
    }
    
    // Update target and current scroll position
    targetScrollY.current = finalScrollY;
    setScrollY(finalScrollY);
    
    // Mark as dragging to show we're actively scrolling
    isDragging.current = true;
    lastScrollTime.current = Date.now();
    
    // Check if scroll has stopped after a threshold
    setTimeout(() => {
      const now = Date.now();
      if (now - lastScrollTime.current >= 100 && isDragging.current) {
        // No scroll events for 100ms, consider it stopped
        isDragging.current = false;
        
        // Find what video we're closest to and snap to it
        const closestVideoIndex = Math.round(targetScrollY.current / containerHeight);
        const validIndex = Math.max(0, Math.min(closestVideoIndex, VIDEOS.length - 1));
        
        if (validIndex !== currentVideoIndex) {
          setCurrentVideoIndex(validIndex);
        }
        
        // Animate to the nearest video
        isSnapAnimating.current = true;
        targetScrollY.current = validIndex * containerHeight;
        animationFrameId.current = requestAnimationFrame(animateScroll);
      }
    }, 100);
  };
  
  // Handle video click to play/pause
  const handleVideoClick = (e: React.MouseEvent) => {
    // Don't trigger on double-tap
    if (Date.now() - lastTap.current < 300) {
      return;
    }
    
    // Only toggle play/pause on single tap/click
    togglePlayPause(e);
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
  
  // Touch handlers for mobile with direct manipulation
  const handleTouchStart = (e: React.TouchEvent) => {
    // If currently snap animating, cancel it
    if (isSnapAnimating.current) {
      isSnapAnimating.current = false;
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    }
    
    touchStartY.current = e.touches[0].clientY;
    touchDeltaY.current = 0;
    isDragging.current = true;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    
    const touchY = e.touches[0].clientY;
    touchDeltaY.current = touchY - touchStartY.current!;
    
    // Direct manipulation - move content with finger
    let newScrollY = scrollY - touchDeltaY.current;
    
    // Check boundaries with elastic effect
    const minScrollY = 0;
    const maxScrollY = (VIDEOS.length - 1) * containerHeight;
    
    if (newScrollY < minScrollY) {
      // Elastic pull at top
      const overscroll = minScrollY - newScrollY;
      newScrollY = minScrollY - (overscroll * 0.2); // 20% elasticity
    } else if (newScrollY > maxScrollY) {
      // Elastic pull at bottom
      const overscroll = newScrollY - maxScrollY;
      newScrollY = maxScrollY + (overscroll * 0.2); // 20% elasticity
    }
    
    targetScrollY.current = newScrollY;
    setScrollY(newScrollY);
    lastScrollTime.current = Date.now();
  };
  
  const handleTouchEnd = () => {
    if (touchStartY.current === null) return;
    
    isDragging.current = false;
    
    // Find nearest video for snapping
    const videoIndex = Math.round(targetScrollY.current / containerHeight);
    const validIndex = Math.max(0, Math.min(videoIndex, VIDEOS.length - 1));
    
    if (validIndex !== currentVideoIndex) {
      setCurrentVideoIndex(validIndex);
    }
    
    // Animate to the nearest video
    isSnapAnimating.current = true;
    targetScrollY.current = validIndex * containerHeight;
    animationFrameId.current = requestAnimationFrame(animateScroll);
    
    // Reset touch state
    touchStartY.current = null;
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        goToNextVideo();
      } else if (e.key === 'ArrowUp') {
        goToPrevVideo();
      } else if (e.key === 'm') {
        toggleMute();
      } else if (e.key === ' ' || e.key === 'Spacebar') { // Space key
        togglePlayPause();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex]);
  
  return (
    <div 
      className="h-screen w-full overflow-hidden bg-black relative"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleDoubleTap}
    >
      {/* Videos container */}
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
            className="absolute w-full"
            style={{ 
              height: containerHeight * VIDEOS.length,
              transform: `translateY(${-scrollY}px)`,
              transition: isSnapAnimating.current ? 'none' : 'transform 0.05s linear'
            }}
          >
            {VIDEOS.map((video, index) => {
              // Only render videos that are close to current
              const isVisible = Math.abs(index - currentVideoIndex) <= 1;
              const isCurrentVideo = index === currentVideoIndex;
              
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
                    <div 
                      className="relative w-full h-full overflow-hidden"
                      onClick={isCurrentVideo ? handleVideoClick : undefined}
                    >
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
                      
                      {/* Play overlay (only show when current and paused) */}
                      {isPaused && isCurrentVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center cursor-pointer">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                      
                      {/* Video info overlay */}
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-white/30">
                            <img 
                              src={`https://randomuser.me/api/portraits/men/${index + 1}.jpg`}
                              alt={video.username} 
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
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
                      <div className="absolute right-3 bottom-20 flex flex-col items-center space-y-5 z-10">
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
          {VIDEOS.map((_, index) => (
            <div 
              key={index}
              className={`rounded-full h-1.5 ${
                index === currentVideoIndex 
                  ? 'w-4 bg-white' 
                  : 'w-1.5 bg-white/50'
              } transition-all duration-150`}
            />
          ))}
        </div>
      </div>
      
      {/* Scroll guide indicator - only show if there are more videos below */}
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
