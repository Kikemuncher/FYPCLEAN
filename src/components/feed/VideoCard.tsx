"use client";

import { useEffect, useRef, useState } from "react";
import { useVideoStore } from "@/store/videoStore";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Improved FeedList with advanced scrolling from original implementation
export default function FeedList() {
  const { 
    videos, 
    currentVideoIndex, 
    setCurrentVideoIndex, 
    fetchVideos,
    fetchMoreVideos,
    loading,
    hasMore,
    likeVideo,
    unlikeVideo 
  } = useVideoStore();
  
  // Container and video state
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const videoTimeRefs = useRef<Record<string, number>>({});
  
  // UI state
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  
  // Scroll handling state
  const [offset, setOffset] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const touchStartY = useRef<number | null>(null);
  const lastTap = useRef<number>(0);
  
  // Wheel event tracking (from original implementation)
  const wheelEvents = useRef<WheelEvent[]>([]);
  const isWheeling = useRef<boolean>(false);
  const wheelDetectionTimer = useRef<any>(null);
  const wheelReleaseTimer = useRef<any>(null);
  const inertiaFrameId = useRef<any>(null);

  // Load initial videos
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);
  
  // Set up container height
  useEffect(() => {
    setContainerHeight(window.innerHeight);
    
    const updateHeight = () => {
      setContainerHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      // Clean up timers and animation frames
      if (wheelDetectionTimer.current) {
        clearTimeout(wheelDetectionTimer.current);
      }
      if (wheelReleaseTimer.current) {
        clearTimeout(wheelReleaseTimer.current);
      }
      if (inertiaFrameId.current) {
        cancelAnimationFrame(inertiaFrameId.current);
      }
    };
  }, []);
  
  // Load more videos when reaching near the end
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0.1,
  });
  
  useEffect(() => {
    if (loadMoreInView && videos.length > 0 && hasMore && !loading) {
      fetchMoreVideos();
    }
  }, [loadMoreInView, fetchMoreVideos, videos.length, hasMore, loading]);
  
  // Handle video playback when switching videos
  useEffect(() => {
    // Pause all videos and save their positions
    Object.entries(videoRefs.current).forEach(([id, videoRef]) => {
      if (videoRef && !videoRef.paused) {
        videoTimeRefs.current[id] = videoRef.currentTime;
        videoRef.pause();
      }
    });
    
    if (videos.length === 0) return;
    
    // Play current video if not paused
    const videoId = videos[currentVideoIndex]?.id;
    if (!videoId) return;
    
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
  }, [currentVideoIndex, videos, isPaused]);
  
  // Format numbers for display
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };
  
  // Toggle mute
  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  // Toggle play/pause with position save/restore
  const togglePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videos.length === 0) return;
    
    const videoId = videos[currentVideoIndex]?.id;
    if (!videoId) return;
    
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
  
  // Handle likes with UI update and store update
  const toggleLike = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setLikedVideos(prev => {
      const newState = {
        ...prev,
        [videoId]: !prev[videoId]
      };
      
      // Also update store
      if (newState[videoId]) {
        likeVideo(videoId);
      } else {
        unlikeVideo(videoId);
      }
      
      return newState;
    });
  };
  
  // Check if scrolling is allowed in the given direction
  const canScrollInDirection = (direction: 'up' | 'down'): boolean => {
    if (direction === 'up') {
      // Can only scroll up if not at the first video
      return currentVideoIndex > 0;
    } else {
      // Can only scroll down if not at the last video
      return currentVideoIndex < videos.length - 1;
    }
  };
  
  // Go to next video if possible
  const goToNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setOffset(0);
    } else {
      // Snap back to current video instantly
      setOffset(0);
    }
  };
  
  // Go to previous video if possible
  const goToPrevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setOffset(0);
    } else {
      // Snap back to current video instantly
      setOffset(0);
    }
  };
  
  // Smooth snap back animation using requestAnimationFrame
  const animateSnapBack = () => {
    const startOffset = offset;
    const startTime = performance.now();
    const duration = 300; // animation duration in ms
    
    const animateFrame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function - ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      // Calculate new offset
      const newOffset = startOffset * (1 - easedProgress);
      
      // Update offset
      setOffset(newOffset);
      
      // Continue animation if not complete
      if (progress < 1) {
        inertiaFrameId.current = requestAnimationFrame(animateFrame);
      } else {
        // Animation complete
        setOffset(0);
        inertiaFrameId.current = null;
      }
    };
    
    // Start animation
    inertiaFrameId.current = requestAnimationFrame(animateFrame);
  };
  
  // Handle wheel release - only called when user STOPS scrolling
  const handleWheelRelease = () => {
    // Only process if there were wheel events
    if (wheelEvents.current.length === 0) return;
    
    // Cancel any running inertia
    if (inertiaFrameId.current) {
      cancelAnimationFrame(inertiaFrameId.current);
      inertiaFrameId.current = null;
    }
    
    // Calculate the average delta and direction from the last few events
    const recentEvents = wheelEvents.current.slice(-5);
    const totalDelta = recentEvents.reduce((sum, event) => sum + event.deltaY, 0);
    const avgDelta = totalDelta / recentEvents.length;
    const direction = avgDelta > 0 ? 'down' : 'up';
    
    // Determine if we've scrolled enough to change videos
    if (Math.abs(offset) > containerHeight * 0.25) {
      if (offset > 0 && canScrollInDirection('up')) {
        goToPrevVideo();
      } else if (offset < 0 && canScrollInDirection('down')) {
        goToNextVideo();
      } else {
        // Snap back with inertia
        animateSnapBack();
      }
    } else {
      // Not enough to change, snap back with inertia
      animateSnapBack();
    }
    
    // Reset wheel tracking
    wheelEvents.current = [];
    isWheeling.current = false;
  };
  
  // Wheel event handler - collects events during scrolling but ONLY processes on release
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Cancel any running animations when wheel starts
    if (inertiaFrameId.current) {
      cancelAnimationFrame(inertiaFrameId.current);
      inertiaFrameId.current = null;
    }
    
    // Clear previous timers
    if (wheelDetectionTimer.current) {
      clearTimeout(wheelDetectionTimer.current);
    }
    if (wheelReleaseTimer.current) {
      clearTimeout(wheelReleaseTimer.current);
    }
    
    // Store wheel event for later processing
    wheelEvents.current.push(e.nativeEvent);
    
    // Limit stored events to prevent memory issues
    if (wheelEvents.current.length > 30) {
      wheelEvents.current = wheelEvents.current.slice(-30);
    }
    
    // Mark as actively wheeling
    isWheeling.current = true;
    
    // Determine direction based on deltaY
    const direction = e.deltaY > 0 ? 'down' : 'up';
    
    // Detect if this is mouse wheel or trackpad
    const isTrackpad = Math.abs(e.deltaY) < 50;
    
    // For trackpad, just apply 1:1 movement while scrolling without any threshold decisions
    if (isTrackpad) {
      // Check if we can scroll in this direction
      if (!canScrollInDirection(direction)) {
        // For boundaries, allow a small elastic pull with resistance
        const elasticFactor = 0.2;
        
        // Only update if the offset would be moving back toward center
        if ((direction === 'up' && offset < 0) || (direction === 'down' && offset > 0)) {
          // Allow full movement back to center
          let newOffset = offset + e.deltaY * -1;
          setOffset(newOffset);
        } else {
          // Restricted elastic pull
          let elasticDelta = e.deltaY * -elasticFactor;
          let newOffset = offset + elasticDelta;
          
          // Prevent pulling too far (max 15% of container height)
          const maxElasticPull = containerHeight * 0.15;
          if (direction === 'up') {
            newOffset = Math.max(newOffset, -maxElasticPull);
          } else {
            newOffset = Math.min(newOffset, maxElasticPull);
          }
          
          setOffset(newOffset);
        }
      } else {
        // Just apply natural 1:1 movement - no decisions yet
        const sensitivity = 1.2; // Slightly higher for better feel
        
        // Calculate new position
        let newOffset = offset + e.deltaY * -sensitivity;
        
        // Apply limits to prevent excessive scrolling
        const maxOffset = containerHeight * 0.8;
        newOffset = Math.max(Math.min(newOffset, maxOffset), -maxOffset);
        
        // Update offset
        setOffset(newOffset);
      }
    } else {
      // For mouse wheel, use classic behavior but just update offset for visibility
      // Process actual navigation on release if needed
      
      // Add to accumulated offset
      const wheelSensitivity = 20; // More conservative for full wheel clicks
      let newOffset = offset + (e.deltaY > 0 ? -wheelSensitivity : wheelSensitivity);
      
      // Apply limits
      const maxOffset = containerHeight * 0.8;
      newOffset = Math.max(Math.min(newOffset, maxOffset), -maxOffset);
      
      // Update offset
      setOffset(newOffset);
    }
    
    // Set a timer to detect when the user STOPS scrolling
    // This is the key part - we ONLY process navigation when scrolling stops
    wheelReleaseTimer.current = setTimeout(() => {
      // Only if we were actively scrolling
      if (isWheeling.current) {
        handleWheelRelease();
      }
    }, 200); // Longer timeout to ensure we don't trigger on pauses between scroll actions
  };
  
  // Touch handlers for mobile - similar approach of collecting during touch and processing on release
  const handleTouchStart = (e: React.TouchEvent) => {
    // Cancel any inertia animation
    if (inertiaFrameId.current) {
      cancelAnimationFrame(inertiaFrameId.current);
      inertiaFrameId.current = null;
    }
    
    touchStartY.current = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    
    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY.current;
    
    // Determine direction
    const direction = diff > 0 ? 'up' : 'down';
    
    // If we can't scroll in this direction, apply elastic resistance
    if (!canScrollInDirection(direction)) {
      // Allow some elastic movement but with high resistance
      const elasticFactor = 0.15;
      let elasticDiff = diff * elasticFactor;
      
      // Limit the maximum elastic pull
      const maxElasticPull = containerHeight * 0.15;
      if (direction === 'up') {
        elasticDiff = Math.min(elasticDiff, maxElasticPull);
      } else {
        elasticDiff = Math.max(elasticDiff, -maxElasticPull);
      }
      
      setOffset(elasticDiff);
      return;
    }
    
    // Normal scrolling behavior when direction is valid
    // Apply limits to prevent excessive scrolling
    let newOffset = diff;
    const maxOffset = containerHeight * 0.8;
    newOffset = Math.max(Math.min(newOffset, maxOffset), -maxOffset);
    
    setOffset(newOffset);
  };
  
  const handleTouchEnd = () => {
    if (touchStartY.current === null) return;
    
    // Process navigation on touch end
    if (Math.abs(offset) > containerHeight * 0.25) {
      if (offset > 0 && canScrollInDirection('up')) {
        goToPrevVideo();
      } else if (offset < 0 && canScrollInDirection('down')) {
        goToNextVideo();
      } else {
        // Snap back with inertia
        animateSnapBack();
      }
    } else {
      // Not enough to navigate, snap back
      animateSnapBack();
    }
    
    // Reset touch state
    touchStartY.current = null;
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
    const now = Date.now();
    const timeSince = now - lastTap.current;
    
    if (timeSince < 300 && timeSince > 0 && videos.length > 0) {
      const currentVideo = videos[currentVideoIndex];
      if (currentVideo) {
        setLikedVideos(prev => {
          const newState = {
            ...prev,
            [currentVideo.id]: true
          };
          
          // Also update store
          likeVideo(currentVideo.id);
          
          return newState;
        });
      }
    }
    
    lastTap.current = now;
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
      } else if (e.key === ' ' || e.key === 'Spacebar') { // Space key
        togglePlayPause();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, videos.length]);
  
  return (
    <div 
      ref={containerRef}
      className="h-screen w-full overflow-hidden bg-black relative touch-none"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleDoubleTap}
    >
      {videos.length === 0 && !loading ? (
        <div className="flex h-full w-full items-center justify-center text-white">
          <p>No videos available.</p>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <div 
            className="absolute w-full transition-transform duration-300 ease-out"
            style={{ 
              height: containerHeight * videos.length,
              transform: `translateY(${-currentVideoIndex * containerHeight + offset}px)`,
            }}
          >
            {videos.map((video, index) => {
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
                        src={video.videoUrl}
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
                              src={video.userAvatar}
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
                        
                        <button className="flex flex-col items-center">
                          <div className="rounded-full bg-black/20 p-2">
                            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </div>
                          <span className="text-white text-xs mt-1">{formatCount(video.shares || 0)}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
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
        <span className="text-white text-sm">{currentVideoIndex + 1} / {videos.length}</span>
      </div>
      
      {/* Progress dots */}
      <div className="absolute top-14 left-0 right-0 flex justify-center z-30">
        <div className="flex space-x-1">
          {videos.map((_, index) => (
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
      {videos.length > 1 && currentVideoIndex === 0 && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/30 px-3 py-1 rounded-full z-30 flex items-center">
          <span className="mr-2">Swipe up for more</span>
          <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      )}
      
      {/* Load more trigger */}
      {hasMore && (
        <div 
          ref={loadMoreRef} 
          className="absolute opacity-0 pointer-events-none"
          style={{ bottom: 20 }}
        />
      )}
      
      {/* Loading indicator */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/30 z-50"
          >
            <div className="h-12 w-12">
