"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

// Other imports and definitions...

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
  // Other videos...
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

// Define the FeedList component 
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
  
  // Scroll-related state
  const [swipeProgress, setSwipeProgress] = useState<number>(0);
  const [isSwipeLocked, setIsSwipeLocked] = useState<boolean>(false);
  const [isTrackpadScrolling, setIsTrackpadScrolling] = useState<boolean>(false);
  
  // Touch refs
  const touchStartY = useRef<number>(0);
  const touchMoveY = useRef<number>(0);
  const lastTap = useRef<number>(0);
  
  // Wheel event tracking
  const wheelEvents = useRef<number[]>([]);
  const lastWheelTime = useRef<number>(0);
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // For trackpad movement detection
  const lastWheelMovement = useRef<number>(Date.now());
  
  // Video element references
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Handle wheel end event for trackpad scrolling
  const handleScrollEnd = useCallback(() => {
    if (isSwipeLocked) return;
    
    // If there's any scroll progress at all, make a decision
    if (swipeProgress !== 0) {
      setIsSwipeLocked(true);
      
      // Calculate how far we've scrolled relative to a threshold
      // Use a more sensitive threshold since we ALWAYS want to snap
      const threshold = containerHeight * 0.12; // Reduced from 0.15 to 0.12 (makes it easier to trigger)
      
      if (Math.abs(swipeProgress) > threshold) {
        // We've scrolled enough to trigger a video change
        if (swipeProgress < 0 && currentVideoIndex < VIDEOS.length - 1) {
          // Progress is negative (scrolling down) - go to next video
          setCurrentVideoIndex(currentVideoIndex + 1);
        } else if (swipeProgress > 0 && currentVideoIndex > 0) {
          // Progress is positive (scrolling up) - go to previous video
          setCurrentVideoIndex(currentVideoIndex - 1);
        }
      }
      
      // ALWAYS reset progress to 0 to avoid stuck state
      // Do this immediately for a more responsive feel
      setSwipeProgress(0);
      
      // Unlock after animation completes - REDUCED from 400ms to 200ms
      setTimeout(() => {
        setIsSwipeLocked(false);
      }, 200);
    }
  }, [isSwipeLocked, swipeProgress, currentVideoIndex, VIDEOS.length, containerHeight]);

  // Setup wheel end detection function
  const handleWheelEndEvent = () => {
    // Only trigger when scrolling has completely stopped (mousepad released)
    if (isTrackpadScrolling && !isSwipeLocked && Math.abs(swipeProgress) > 0) {
      // Since the user has fully stopped scrolling, now we decide what to do
      handleScrollEnd();
    }
  };
  
  // Detect trackpad vs mouse wheel
  const detectTrackpad = useCallback((e: WheelEvent) => {
    // Most trackpads send wheel events with smaller deltas and pixelated values
    // While mouse wheels typically have larger deltas and are more discrete
    const now = Date.now();
    wheelEvents.current.push(Math.abs(e.deltaY));
    
    // Keep only recent events for analysis
    const recentEvents = wheelEvents.current.slice(-5);
    wheelEvents.current = recentEvents;
    
    // If we have enough events to analyze
    if (recentEvents.length >= 3) {
      // Calculate average delta
      const avgDelta = recentEvents.reduce((sum, delta) => sum + delta, 0) / recentEvents.length;
      
      // Check time between events
      const timeDiff = now - lastWheelTime.current;
      
      // Trackpads typically send many small events in quick succession
      const isLikelyTrackpad = 
        (avgDelta < 10 || recentEvents.some(delta => delta < 5)) && 
        timeDiff < 100; // Events are close together
      
      setIsTrackpadScrolling(isLikelyTrackpad);
    }
    
    lastWheelTime.current = now;
    
    // Reset trackpad detection after a period of inactivity
    if (wheelTimeout.current) {
      clearTimeout(wheelTimeout.current);
    }
    
    wheelTimeout.current = setTimeout(() => {
      wheelEvents.current = [];
      setIsTrackpadScrolling(false);
    }, 500);
  }, []);
  
  // Handle wheel event for scrolling with improved detection
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Record this wheel movement time
    lastWheelMovement.current = Date.now();
    
    // Pass to detector
    detectTrackpad(e.nativeEvent);
    
    if (isSwipeLocked) return;
    
    const delta = e.deltaY;
    
    // Determine if this is likely a discrete mouse wheel "click"
    const isDiscreteWheel = Math.abs(delta) > 30 && !isTrackpadScrolling;
    
    // For discrete mouse wheel, move directly to next/prev video
    if (isDiscreteWheel) {
      if (delta > 0 && currentVideoIndex < VIDEOS.length - 1) {
        // Scrolling down - next video (delta > 0 means scrolling down)
        setIsSwipeLocked(true);
        setCurrentVideoIndex(currentVideoIndex + 1);
        setSwipeProgress(0);
        setTimeout(() => {
          setIsSwipeLocked(false);
        }, 300);
      } else if (delta < 0 && currentVideoIndex > 0) {
        // Scrolling up - previous video (delta < 0 means scrolling up)
        setIsSwipeLocked(true);
        setCurrentVideoIndex(currentVideoIndex - 1);
        setSwipeProgress(0);
        setTimeout(() => {
          setIsSwipeLocked(false);
        }, 300);
      }
      return;
    }
    
    // For trackpad or continuous scrolling, update progress in a natural direction
    // Apply a multiplier for sensitivity adjustment - Significantly increased for more responsiveness
    const progressDelta = -delta * 0.9; // Was 0.6, increased to 0.9 for higher sensitivity
    
    // Update progress for visual feedback
    let newProgress = swipeProgress + progressDelta;
    
    // Apply resistance at the ends
    if ((currentVideoIndex === 0 && newProgress > 0) || 
        (currentVideoIndex === VIDEOS.length - 1 && newProgress < 0)) {
      newProgress = newProgress * 0.3; // Resistance factor
    }
    
    // Clamp the progress to reasonable limits - reduced maximum for more control
    const maxProgress = containerHeight * 0.3; // Allow scrolling up to 30% of the screen (was 40%)
    newProgress = Math.max(Math.min(newProgress, maxProgress), -maxProgress);
    
    setSwipeProgress(newProgress);
    
    // IMPORTANT: We never change videos during wheel events, only on release
    // This will only happen on wheel end/release via handleScrollEnd
  }, [swipeProgress, isSwipeLocked, currentVideoIndex, VIDEOS.length, detectTrackpad, isTrackpadScrolling, containerHeight]);
  
  // Handle touch events for mobile with improved inertia
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
    touchMoveY.current = e.touches[0].clientY;
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (isSwipeLocked) return;
    
    const currentY = e.touches[0].clientY;
    const diff = touchStartY.current - currentY;
    touchMoveY.current = currentY;
    
    // For touch, we use the difference from the start position for more natural feel
    // This creates a direct 1:1 mapping between finger position and content position
    const swipeDistance = diff * 2.0; // Significantly increased from 1.44 for much higher sensitivity
    
    // Calculate progress - FLIPPED SIGN for consistent direction
    let newProgress = -(swipeDistance / containerHeight) * 100;
    
    // Apply resistance at the ends
    if ((currentVideoIndex === 0 && newProgress > 0) || 
        (currentVideoIndex === VIDEOS.length - 1 && newProgress < 0)) {
      newProgress = newProgress * 0.3;
    }
    
    // Clamp to reasonable limits
    const maxProgress = containerHeight * 0.3;
    newProgress = Math.max(Math.min(newProgress, maxProgress), -maxProgress);
    
    setSwipeProgress(newProgress);
    
    // We don't change videos during touch, only on touch end
  }, [isSwipeLocked, currentVideoIndex, VIDEOS.length, containerHeight]);
  
  // Reset progress when touch ends with improved deceleration
  const handleTouchEnd = useCallback(() => {
    handleScrollEnd();
  }, [handleScrollEnd]);
  
  // Custom transition settings based on interaction type
  const getTransitionSettings = useCallback(() => {
    if (isSwipeLocked) {
      // Full animation when snapping to a video - much faster with higher stiffness
      return {
        type: "spring",
        stiffness: 700,  // Increased from 500 to 700 for faster snapping
        damping: 80,     // Increased from 50 to 80 for less bounce
        duration: 0.2,   // Reduced from 0.4 to 0.2 for faster transitions
        restDelta: 0.0001
      };
    } else if (Math.abs(swipeProgress) > 0) {
      // Responsive movement during active scrolling
      return {
        type: "spring",
        stiffness: 1500, // Increased from 1200 for even more responsive feel
        damping: 100,    // Reduced from 120 to 100 for slightly more fluid movement
        duration: 0.05   // Reduced from 0.1 to 0.05 for faster response
      };
    } else {
      // Default state
      return {
        type: "spring",
        stiffness: 700,  // Matched to the locked state
        damping: 80,     // Matched to the locked state
        duration: 0.2    // Matched to the locked state
      };
    }
  }, [isSwipeLocked, swipeProgress]);
  
  // Set up client-side detection and more
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
      if (e.key === 'ArrowUp' || e.key === 'k') {
        if (currentVideoIndex > 0) {
          setIsSwipeLocked(true);
          setCurrentVideoIndex(currentVideoIndex - 1);
          setTimeout(() => {
            setIsSwipeLocked(false);
          }, 300);
        }
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        if (currentVideoIndex < VIDEOS.length - 1) {
          setIsSwipeLocked(true);
          setCurrentVideoIndex(currentVideoIndex + 1);
          setTimeout(() => {
            setIsSwipeLocked(false);
          }, 300);
        }
      } else if (e.key === 'm') {
        setIsMuted(!isMuted);
      } else if (e.key === ' ' || e.key === 'p') {
        // Toggle play/pause
        const currentVideo = videoRefs.current[VIDEOS[currentVideoIndex]?.id];
        if (currentVideo) {
          if (currentVideo.paused) {
            currentVideo.play().catch(e => console.error("Play failed:", e));
          } else {
            currentVideo.pause();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // We force ending wheel events when no scroll has happened for a brief period
    // But ONLY when the user stops scrolling completely (on mousepad release)
    let activeScrollTimeout: NodeJS.Timeout | null = null;
    
    // Listen for the end of scrolling with more frequent checks
    const wheelHandler = () => {
      // Cancel previous timeouts
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }
      if (activeScrollTimeout) {
        clearTimeout(activeScrollTimeout);
      }
      
      // Set normal end detection timeout (when scrolling fully stops)
      // This only triggers when the user RELEASES the mousepad or stops scrolling
      wheelTimeout.current = setTimeout(handleWheelEndEvent, 40);
      
      // DO NOT set an additional timeout that would trigger during active scrolling
      // Only change videos when the user fully stops scrolling/releases
    };
    
    window.addEventListener('wheel', wheelHandler, { passive: false });
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', wheelHandler);
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }
      if (activeScrollTimeout) {
        clearTimeout(activeScrollTimeout);
      }
    };
  }, [currentVideoIndex, isMuted, isTrackpadScrolling, handleScrollEnd, swipeProgress, isSwipeLocked]);
  
  // The rest of the component logic and return statement...
}

// Make sure to export default
export default FeedList;
