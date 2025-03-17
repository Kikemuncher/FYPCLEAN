"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useVideoStore } from "@/store/videoStore";
import { VideoData } from "@/types/video";

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
  console.log("Rendering FeedList component");
  // Client-side rendering detection
  const [isClient, setIsClient] = useState<boolean>(false);
  
  // State from Zustand store
  const { 
    videos, 
    currentVideoIndex, 
    setCurrentVideoIndex, 
    fetchVideos,
    fetchMoreVideos,
    likeVideo,
    unlikeVideo,
    saveVideo,
    shareVideo,
    incrementView,
    loading,
    hasMore 
  } = useVideoStore();
  
  // Local UI state
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Container height and width
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  
  // Direct scroll position (for fluid trackpad scrolling)
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  
  // Scroll animation state
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const scrollRef = useRef<number>(0);
  const mouseWheelRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const lastScrollTime = useRef<number>(0);
  const scrollVelocity = useRef<number>(0);
  const lastDeltaY = useRef<number>(0);
  const lastTap = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);
  const prevTouchY = useRef<number | null>(null);
  const touchVelocity = useRef<number>(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef<boolean>(false);
  
  // Load initial videos
  useEffect(() => {
    setIsClient(true);
    
    if (!hasInitialized.current) {
      fetchVideos();
      hasInitialized.current = true;
    }
  }, [fetchVideos]);
  
  // Update dimensions on resize or videos change
  useEffect(() => {
    if (!isClient || videos.length === 0) return;
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isClient, videos]);
  
  // Update container dimensions
  const updateDimensions = useCallback(() => {
    const height = window.innerHeight;
    // Use 9:16 aspect ratio
    const width = Math.min(window.innerWidth, (height * 9) / 16);
    
    setContainerHeight(height);
    setContainerWidth(width);
    
    // Reset scroll position to current video
    setScrollPosition(-currentVideoIndex * height);
    scrollRef.current = -currentVideoIndex * height;
  }, [currentVideoIndex]);
  
  // Toggle mute
  const toggleMute = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(prev => !prev);
  }, []);
  
  // Handle likes
  const handleLike = useCallback((videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setLikedVideos(prev => {
      const isCurrentlyLiked = !!prev[videoId];
      
      if (isCurrentlyLiked) {
        unlikeVideo(videoId);
        const newState = { ...prev };
        delete newState[videoId];
        return newState;
      } else {
        likeVideo(videoId);
        return { ...prev, [videoId]: true };
      }
    });
  }, [likeVideo, unlikeVideo]);
  
  // Handle shares
  const handleShare = useCallback((videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    shareVideo(videoId);
    // Could add share UI here
  }, [shareVideo]);
  
  // Handle saves
  const handleSave = useCallback((videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveVideo(videoId);
    // Could add save feedback UI here
  }, [saveVideo]);
  
  // Manage video playback based on visibility
  useEffect(() => {
    if (!isClient || videos.length === 0 || containerHeight === 0) return;
    
    const handleVideoPlayback = () => {
      // Calculate which video should be playing based on scroll position
      const activeIndex = Math.round(Math.abs(scrollPosition) / containerHeight);
      if (activeIndex < 0 || activeIndex >= videos.length) return;
      
      // Pause all videos first
      Object.values(videoRefs.current).forEach(videoRef => {
        if (videoRef && !videoRef.paused) {
          videoRef.pause();
        }
      });
      
      // Play the active video
      const currentVideo = videos[activeIndex];
      if (!currentVideo) return;
      
      const videoElement = videoRefs.current[currentVideo.id];
      if (videoElement) {
        // Reset video if it's at the end
        if (videoElement.currentTime >= videoElement.duration - 0.1) {
          videoElement.currentTime = 0;
        }
        
        const playPromise = videoElement.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            console.log("Autoplay prevented, waiting for user interaction");
          });
        }
        
        // Track the view (debounced by the store)
        incrementView(currentVideo.id);
      }
    };
    
    handleVideoPlayback();
  }, [isClient, videos, scrollPosition, containerHeight, incrementView]);
  
  // Update current video index based on scroll position
  useEffect(() => {
    if (isAnimating || containerHeight === 0 || videos.length === 0) return;
    
    const index = Math.round(Math.abs(scrollPosition) / containerHeight);
    if (index !== currentVideoIndex && index >= 0 && index < videos.length) {
      setCurrentVideoIndex(index);
    }
  }, [scrollPosition, containerHeight, isAnimating, currentVideoIndex, videos, setCurrentVideoIndex]);
  
  // Smooth scroll animation
  const animateScroll = useCallback((targetPosition: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    setIsAnimating(true);
    
    const startPosition = scrollRef.current;
    const distance = targetPosition - startPosition;
    const duration = 300; // ms
    const startTime = performance.now();
    
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      scrollRef.current = startPosition + distance * easedProgress;
      setScrollPosition(scrollRef.current);
      
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
        setIsAnimating(false);
      }
    };
    
    rafRef.current = requestAnimationFrame(animate);
  }, []);
  
  // Navigate to specific video with animation
  const navigateToVideo = useCallback((index: number) => {
    if (videos.length === 0 || index < 0 || index >= videos.length || isAnimating) return;
    
    const targetPosition = -index * containerHeight;
    animateScroll(targetPosition);
    setCurrentVideoIndex(index);
  }, [containerHeight, videos, isAnimating, animateScroll, setCurrentVideoIndex]);
  
  // Momentum scroll logic with snap-to-video
  const applyMomentumScroll = useCallback(() => {
    if (isAnimating || videos.length === 0) return;
    
    const now = performance.now();
    const elapsed = now - lastScrollTime.current;
    lastScrollTime.current = now;
    
    // Apply velocity with deceleration
    const deceleration = 0.95; // Higher value = less friction
    scrollVelocity.current *= deceleration;
    
    // Stop if velocity is very small
    if (Math.abs(scrollVelocity.current) < 0.5) {
      scrollVelocity.current = 0;
      
      // Snap to nearest video
      const targetIndex = Math.round(Math.abs(scrollRef.current) / containerHeight);
      const targetPosition = -targetIndex * containerHeight;
      
      // Only animate if we're not already very close to target
      if (Math.abs(scrollRef.current - targetPosition) > 5) {
        animateScroll(targetPosition);
      }
      return;
    }
    
    // Apply velocity to scroll position
    scrollRef.current += scrollVelocity.current;
    
    // Apply boundaries
    const maxScroll = 0;
    const minScroll = -(videos.length - 1) * containerHeight;
    
    if (scrollRef.current > maxScroll) {
      // Rubber band effect at top
      scrollRef.current = maxScroll + (scrollRef.current - maxScroll) * 0.2;
      scrollVelocity.current *= 0.8; // Reduce velocity faster at boundaries
    } else if (scrollRef.current < minScroll) {
      // Rubber band effect at bottom
      scrollRef.current = minScroll + (scrollRef.current - minScroll) * 0.2;
      scrollVelocity.current *= 0.8; // Reduce velocity faster at boundaries
    }
    
    setScrollPosition(scrollRef.current);
    
    // Continue animation
    rafRef.current = requestAnimationFrame(applyMomentumScroll);
  }, [containerHeight, isAnimating, videos, animateScroll]);
  
  // Trackpad-specific scroll handler
  const handleTrackpadScroll = useCallback((deltaY: number) => {
    if (isAnimating || videos.length === 0) return;
    
    // Cancel any existing animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    const now = performance.now();
    const elapsed = now - lastScrollTime.current;
    lastScrollTime.current = now;
    
    // Calculate velocity based on deltaY and time elapsed
    if (elapsed > 0 && elapsed < 100) { // Ignore if too much time has passed
      scrollVelocity.current = ((deltaY * 1.2) / elapsed) * 16; // Scale for 60fps
    }
    
    // Update scroll position directly for immediate feedback
    scrollRef.current -= deltaY * 1.2; // Multiply for more responsive feel
    
    // Apply boundaries with rubber band effect
    const maxScroll = 0;
    const minScroll = -(videos.length - 1) * containerHeight;
    
    if (scrollRef.current > maxScroll) {
      // Rubber band effect at top
      scrollRef.current = maxScroll + (scrollRef.current - maxScroll) * 0.2;
    } else if (scrollRef.current < minScroll) {
      // Rubber band effect at bottom
      scrollRef.current = minScroll + (scrollRef.current - minScroll) * 0.2;
    }
    
    setScrollPosition(scrollRef.current);
    
    // Save last deltaY for detecting direction changes
    lastDeltaY.current = deltaY;
  }, [isAnimating, containerHeight, videos]);
  
  // Mouse wheel specific handler - immediate navigation
  const handleMouseWheelScroll = useCallback((deltaY: number) => {
    if (videos.length === 0) return;
    
    const direction = deltaY > 0 ? 1 : -1;
    const targetIndex = Math.max(0, Math.min(videos.length - 1, currentVideoIndex + direction));
    
    if (targetIndex !== currentVideoIndex) {
      navigateToVideo(targetIndex);
    }
  }, [currentVideoIndex, navigateToVideo, videos]);
  
  // Enhanced wheel event handler - differentiates trackpad vs mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const { deltaY, deltaMode } = e;
    
    // Skip if deltaY is 0
    if (deltaY === 0) return;
    
    // Detect if this is a mouse wheel or trackpad
    // Mouse wheels typically have larger deltaY values and deltaMode might be different
    const isMouseWheel = Math.abs(deltaY) > 50 || deltaMode !== 0;
    
    if (isMouseWheel) {
      mouseWheelRef.current = true;
      handleMouseWheelScroll(deltaY);
    } else {
      // For trackpad, use smooth scrolling
      handleTrackpadScroll(deltaY);
      
      // Clear any existing timeout for ending the scroll
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      // Set a timeout to apply momentum scrolling when user stops scrolling
      setTimeout(() => {
        if (!mouseWheelRef.current) {
          rafRef.current = requestAnimationFrame(applyMomentumScroll);
        }
      }, 100);
      
      mouseWheelRef.current = false;
    }
  }, [handleMouseWheelScroll, handleTrackpadScroll, applyMomentumScroll]);
  
  // Double tap to like
  const handleDoubleTap = useCallback(() => {
    if (videos.length === 0) return;
    
    const now = Date.now();
    const timeSince = now - lastTap.current;
    
    if (timeSince < 300 && timeSince > 0) {
      const currentVideo = videos[currentVideoIndex];
      if (!currentVideo) return;
      
      if (!likedVideos[currentVideo.id]) {
        likeVideo(currentVideo.id);
        setLikedVideos(prev => ({
          ...prev,
          [currentVideo.id]: true
        }));
        
        // Could add heart animation here
      }
    }
    
    lastTap.current = now;
  }, [currentVideoIndex, videos, likedVideos, likeVideo]);
  
  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isAnimating || videos.length === 0) return;
    
    // Cancel any ongoing animations
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    touchStartY.current = e.touches[0].clientY;
    prevTouchY.current = e.touches[0].clientY;
    touchVelocity.current = 0;
    lastScrollTime.current = performance.now();
  }, [isAnimating, videos]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null || prevTouchY.current === null || isAnimating || videos.length === 0) return;
    
    const touchY = e.touches[0].clientY;
    const deltaY = prevTouchY.current - touchY;
    
    // Calculate touch velocity
    const now = performance.now();
    const elapsed = now - lastScrollTime.current;
    lastScrollTime.current = now;
    
    if (elapsed > 0) {
      touchVelocity.current = (deltaY / elapsed) * 16; // Scale for 60fps
    }
    
    // Apply delta to scroll position
    scrollRef.current -= deltaY * 1.2; // Multiply for more responsive feel
    
    // Apply boundaries with rubber band effect
    const maxScroll = 0;
    const minScroll = -(videos.length - 1) * containerHeight;
    
    if (scrollRef.current > maxScroll) {
      // Rubber band effect at top
      scrollRef.current = maxScroll + (scrollRef.current - maxScroll) * 0.2;
    } else if (scrollRef.current < minScroll) {
      // Rubber band effect at bottom
      scrollRef.current = minScroll + (scrollRef.current - minScroll) * 0.2;
    }
    
    setScrollPosition(scrollRef.current);
    
    // Update previous touch position
    prevTouchY.current = touchY;
  }, [isAnimating, videos, containerHeight]);
  
  const handleTouchEnd = useCallback(() => {
    if (touchStartY.current === null || prevTouchY.current === null || videos.length === 0) return;
    
    // Apply momentum based on last known velocity
    scrollVelocity.current = touchVelocity.current;
    
    // Start momentum scrolling
    rafRef.current = requestAnimationFrame(applyMomentumScroll);
    
    // Reset touch tracking
    touchStartY.current = null;
    prevTouchY.current = null;
  }, [videos, applyMomentumScroll]);
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!isClient) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        navigateToVideo(currentVideoIndex + 1);
      } else if (e.key === 'ArrowUp') {
        navigateToVideo(currentVideoIndex - 1);
      } else if (e.key === 'm') {
        toggleMute();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, navigateToVideo, toggleMute, isClient]);
  
  // Load more videos when reaching near the end
  useEffect(() => {
    if (!isClient || !hasMore || loading || videos.length === 0) return;
    
    // If we're near the end, load more videos
    const lastVideoThreshold = videos.length - 2;
    if (currentVideoIndex >= lastVideoThreshold) {
      fetchMoreVideos();
    }
  }, [currentVideoIndex, fetchMoreVideos, hasMore, loading, videos, isClient]);
  
  // Loading state or no videos
  if (!isClient || videos.length === 0) {
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
      {/* Viewport container with centered content */}
      <div className="flex items-center justify-center h-full w-full">
        {/* Videos container with 9:16 aspect ratio */}
        <div 
          className="relative overflow-hidden"
          style={{ 
            width: containerWidth,
            height: containerHeight
          }}
        >
          {/* Videos container with transform */}
          <div 
            className="absolute w-full transition-transform duration-0"
            style={{ 
              height: containerHeight * videos.length,
              transform: `translateY(${scrollPosition}px)`,
            }}
          >
            {videos.map((video, index) => {
              // Only render videos that are potentially visible
              const distanceFromCurrent = Math.abs(index - Math.abs(scrollPosition / containerHeight));
              const isVisible = distanceFromCurrent < 2;
              
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
                        src={video.videoUrl}
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
                              src={video.userAvatar || `https://randomuser.me/api/portraits/men/${index + 1}.jpg`}
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
                          onClick={(e) => handleLike(video.id, e)}
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
                          <span className="text-white text-xs mt-1">{formatCount(video.likes || 0)}</span>
                        </button>
                        
                        <button className="flex flex-col items-center">
                          <div className="rounded-full bg-black/20 p-2">
                            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <span className="text-white text-xs mt-1">{formatCount(video.comments || 0)}</span>
                        </button>
                        
                        <button 
                          className="flex flex-col items-center"
                          onClick={(e) => handleSave(video.id, e)}
                        >
                          <div className="rounded-full bg-black/20 p-2">
                            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </div>
                          <span className="text-white text-xs mt-1">{formatCount(video.saves || 0)}</span>
                        </button>
                        
                        <button 
                          className="flex flex-col items-center"
                          onClick={(e) => handleShare(video.id, e)}
                        >
                          <div className="rounded-full bg-black/20 p-2">
                            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
