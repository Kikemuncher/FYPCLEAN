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
    incrementView,
    loading,
    hasMore 
  } = useVideoStore();
  
  // Local UI state
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [containerDimensions, setContainerDimensions] = useState({ height: 0, width: 0 });
  
  // Refs for DOM interactions and scroll management
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const isScrolling = useRef<boolean>(false);
  const scrollAccumulator = useRef<number>(0);
  const lastTap = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const interactionInProgress = useRef<boolean>(false);
  
  // Set initial client-side state
  useEffect(() => {
    setIsClient(true);
    fetchVideos();
  }, [fetchVideos]);
  
  // Toggle mute
  const toggleMute = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(prev => !prev);
  }, []);
  
  // Update container dimensions for optimal 9:16 aspect ratio
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    
    const height = window.innerHeight;
    // Calculate max width to maintain 9:16 aspect ratio (width = height * 9/16)
    // But don't exceed viewport width
    const maxWidth = Math.min(window.innerWidth, (height * 9) / 16);
    
    setContainerDimensions({
      height,
      width: maxWidth
    });
  }, []);
  
  // Initialize dimensions and add resize listener
  useEffect(() => {
    if (!isClient) return;
    
    updateDimensions();
    
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions, isClient]);
  
  // Navigate to a specific video
  const navigateToVideo = useCallback((index: number) => {
    if (!videos.length || interactionInProgress.current) return;
    
    // Boundary checks
    if (index < 0 || index >= videos.length || index === currentVideoIndex) return;
    
    interactionInProgress.current = true;
    
    // Update the current video index in the store
    setCurrentVideoIndex(index);
    
    // Reset the scrolling accumulator
    scrollAccumulator.current = 0;
    
    // Track view for analytics
    incrementView(videos[index].id);
    
    // Reset the interaction lock after animation completes
    setTimeout(() => {
      interactionInProgress.current = false;
    }, 400);
  }, [videos, currentVideoIndex, setCurrentVideoIndex, incrementView]);
  
  // Handle video playback when current index changes
  useEffect(() => {
    if (!isClient || videos.length === 0) return;
    
    // Pause all videos first
    Object.values(videoRefs.current).forEach(videoRef => {
      if (videoRef && !videoRef.paused) {
        videoRef.pause();
      }
    });
    
    // Play current video
    const currentVideo = videos[currentVideoIndex];
    if (!currentVideo) return;
    
    const videoElement = videoRefs.current[currentVideo.id];
    if (videoElement) {
      videoElement.currentTime = 0;
      const playPromise = videoElement.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.log("Autoplay prevented, waiting for user interaction");
        });
      }
    }
  }, [currentVideoIndex, videos, isClient]);
  
  // Toggle like for a video
  const handleLike = useCallback((videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setLikedVideos(prev => {
      const newState = { ...prev };
      const wasLiked = !!prev[videoId];
      
      if (wasLiked) {
        unlikeVideo(videoId);
        delete newState[videoId];
      } else {
        likeVideo(videoId);
        newState[videoId] = true;
      }
      
      return newState;
    });
  }, [likeVideo, unlikeVideo]);
  
  // Handle double tap to like
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
  
  // Optimized wheel event handler that differentiates between trackpad and mouse
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (videos.length === 0 || interactionInProgress.current) return;
    
    // Detect if this is likely a trackpad (smaller, more precise deltas)
    // or a mouse wheel (larger deltas)
    const isTrackpadLike = Math.abs(e.deltaY) < 40;
    
    if (isTrackpadLike) {
      // For trackpad scrolling, accumulate deltas until threshold
      scrollAccumulator.current += e.deltaY;
      
      // Clear any existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      // Set up a new timeout to handle end of scrolling gesture
      scrollTimeout.current = setTimeout(() => {
        const threshold = 80; // Adjust threshold based on testing
        
        if (scrollAccumulator.current > threshold) {
          navigateToVideo(currentVideoIndex + 1);
        } else if (scrollAccumulator.current < -threshold) {
          navigateToVideo(currentVideoIndex - 1);
        }
