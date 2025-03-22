"use client";

import React, { useEffect, useState, useRef } from "react";
import { useVideoStore } from "@/store/videoStore";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

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
  } = useVideoStore();
  
  // Current active video
  // Video element references
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const videoTimeRefs = useRef<Record<string, number>>({});
  
  // Container height
  const [containerHeight, setContainerHeight] = useState<number>(0);
  
  // For tactile scrolling
  const [offset, setOffset] = useState<number>(0);
  
  // Track likes
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  
  // Video playing state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true); // Start paused
  
  // Last tap for double tap detection
  const lastTap = useRef<number>(0);
  
  // Touch tracking
  const touchStartY = useRef<number | null>(null);
  
  // Wheel handling with improved tracking
  const wheelEvents = useRef<WheelEvent[]>([]);
  const isWheeling = useRef<boolean>(false);
  const wheelDetectionTimer = useRef<any>(null);
  const wheelReleaseTimer = useRef<any>(null);
  const inertiaFrameId = useRef<any>(null);
  
  // Track scroll velocity for dynamic sensitivity
  const lastScrollTime = useRef<number>(0);
  const scrollVelocity = useRef<number>(0);
  
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
  
  // Check every 500ms to ensure videos don't get stuck
  useEffect(() => {
    const ensureSnapping = () => {
      // If we detect a partial offset that's not animating, force snap back
      if (Math.abs(offset) > 10 && !inertiaFrameId.current && !isWheeling.current) {
        animateSnapBack();
      }
    };
    
    const snapInterval = setInterval(ensureSnapping, 500);
    
    return () => {
      clearInterval(snapInterval);
    };
  }, [offset]);
  
  // Load more videos when reaching near the end
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0.1,
  });
  
  useEffect(() => {
    if (loadMoreInView && videos.length > 0 && hasMore && !loading) {
      fetchMoreVideos();
    }
  }, [loadMoreInView, fetchMoreVideos, videos.length, hasMore, loading]);
  
  // Toggle mute
  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  // Toggle play/pause - Save and restore position
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
  
  // Handle likes
  const toggleLike = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedVideos(prev => {
      const newState = {
        ...prev,
        [videoId]: !prev[videoId]
      };
      
      // Update store
      if (newState[videoId]) {
        likeVideo(videoId);
      }
      
      return newState;
    });
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
  
  // Go to next video with improved immediate response
  const goToNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      // Immediately stop any animations to prevent lag
      if (inertiaFrameId.current) {
        cancelAnimationFrame(inertiaFrameId.current);
        inertiaFrameId.current = null;
      }
      
      // Reset offset immediately to prevent stuck videos
      setOffset(0);
      
      // Use RAF to ensure the offset reset is processed before changing index
      requestAnimationFrame(() => {
        setCurrentVideoIndex(currentVideoIndex + 1);
      });
    } else {
      // Snap back to current video instantly without animation
      setOffset(0);
    }
  };
  
  // Go to previous video with improved immediate response
  const goToPrevVideo = () => {
    if (currentVideoIndex > 0) {
      // Immediately stop any animations to prevent lag
      if (inertiaFrameId.current) {
        cancelAnimationFrame(inertiaFrameId.current);
        inertiaFrameId.current = null;
      }
      
      // Reset offset immediately to prevent stuck videos
      setOffset(0);
      
      // Use RAF to ensure the offset reset is processed before changing index
      requestAnimationFrame(() => {
        setCurrentVideoIndex(currentVideoIndex - 1);
      });
    } else {
      // Snap back to current video instantly without animation
      setOffset(0);
    }
  };
  
  // Improved snap back animation with optimized timing
  const animateSnapBack = () => {
    const startOffset = offset;
    const startTime = performance.now();
    
    // Adjust timing based on distance to make small adjustments feel snappier
    const offsetRatio = Math.abs(startOffset) / containerHeight;
    const duration = Math.max(150, Math.min(300, 300 * offsetRatio)); // Between 150-300ms
    
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
  
  // Improved wheel release handler with better snap decision logic
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
    
    // Calculate momentum from scroll speed
    const momentum = Math.abs(avgDelta);
    
    // Determine the threshold based on momentum and container size
    // Lower threshold (easier to change videos) when scrolling fast
    const thresholdPercentage = momentum > 50 ? 0.15 : 0.25;
    const threshold = containerHeight * thresholdPercentage;
    
    // Determine if we've scrolled enough to change videos
    if (Math.abs(offset) > threshold) {
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
  
  // Improved wheel event handler that better distinguishes between trackpad and mouse wheel
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Calculate time since last scroll event for velocity tracking
    const now = performance.now();
    const timeSinceLastScroll = now - lastScrollTime.current;
    lastScrollTime.current = now;
    
    // Update scroll velocity (pixels per millisecond)
    if (timeSinceLastScroll > 0) {
      scrollVelocity.current = Math.abs(e.deltaY) / timeSinceLastScroll;
    }
    
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
    
    // Better detection for trackpad vs mouse wheel
    // Trackpads typically produce smaller deltaY values and often have deltaX as well
    const isTrackpad = Math.abs(e.deltaY) < 40 || Math.abs(e.deltaX) > 0;
    
    // For both trackpad and wheel, apply 1:1 movement without making navigation decisions yet
    // This makes the movement feel more natural during active scrolling
    
    // Check if we can scroll in this direction
    if (!canScrollInDirection(direction)) {
      // For boundaries, allow a small elastic pull with resistance
      const elasticFactor = 0.15;
      
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
      // Apply 1:1 movement without making navigation decisions
      // Adjust sensitivity based on input type and speed
      let sensitivity;
      
      // Calculate velocity from recent events
      const recentEvents = wheelEvents.current.slice(-3);
      const avgDelta = recentEvents.reduce((sum, evt) => sum + Math.abs(evt.deltaY), 0) / recentEvents.length;
      
      // Dynamic sensitivity based on scrolling speed
      if (isTrackpad) {
        // For trackpad: higher sensitivity for fast swipes, normal for slow
        sensitivity = avgDelta > 20 ? 2.0 : 1.0;
      } else {
        // For mouse wheel: smoother transitions
        sensitivity = avgDelta > 80 ? 30 : 15;
      }
      
      // Calculate new position
      let newOffset = offset + e.deltaY * -sensitivity;
      
      // Apply limits to prevent excessive scrolling
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
    }, 150); // Shorter timeout for more responsive feedback
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
  
  // Improved touch handlers with better momentum detection
  const handleTouchStart = (e: React.TouchEvent) => {
    // Cancel any inertia animation
    if (inertiaFrameId.current) {
      cancelAnimationFrame(inertiaFrameId.current);
      inertiaFrameId.current = null;
    }
    
    touchStartY.current = e.touches[0].clientY;
    lastScrollTime.current = performance.now();
    scrollVelocity.current = 0;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    
    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY.current;
    
    // Calculate velocity for momentum-based snapping
    const now = performance.now();
    const timeSinceLastTouch = now - lastScrollTime.current;
    
    if (timeSinceLastTouch > 0) {
      // Pixels per millisecond
      scrollVelocity.current = Math.abs(diff) / timeSinceLastTouch;
    }
    
    lastScrollTime.current = now;
    
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
    // Use velocity to determine threshold - faster swipes need less distance
    const velocityFactor = Math.min(1, scrollVelocity.current * 10);
    const thresholdPercentage = Math.max(0.1, 0.25 - (velocityFactor * 0.1));
    const threshold = containerHeight * thresholdPercentage;
    
    if (Math.abs(offset) > threshold) {
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
    scrollVelocity.current = 0;
  };
