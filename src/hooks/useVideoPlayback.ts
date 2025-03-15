// src/hooks/useVideoPlayback.ts
import { useState, useEffect, RefObject, MutableRefObject } from 'react';
import { VideoData } from '@/types/video';

export function useVideoPlayback(
  videoRefs: MutableRefObject<{ [key: string]: HTMLVideoElement | null }>,
  currentIndex: number,
  videos: VideoData[],
  onPlay?: (videoId: string) => void
) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // Handle auto-play when current index changes
  useEffect(() => {
    if (!videos.length) return;

    // Pause all videos first
    Object.values(videoRefs.current).forEach(videoRef => {
      if (videoRef && !videoRef.paused) {
        videoRef.pause();
      }
    });

    // Get current video
    const currentVideo = videos[currentIndex];
    if (!currentVideo) return;
    
    const videoElement = videoRefs.current[currentVideo.id];
    if (!videoElement) return;

    // Reset video position
    videoElement.currentTime = 0;
    
    // Play video with error handling
    const playPromise = videoElement.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setPlaybackError(null);
          if (onPlay) onPlay(currentVideo.id);
        })
        .catch(error => {
          console.error('Playback error:', error);
          setIsPlaying(false);
          setPlaybackError('Auto-play prevented. Click to play.');
        });
    }
    
    // Clean up on unmount
    return () => {
      if (videoElement && !videoElement.paused) {
        videoElement.pause();
      }
    };
  }, [currentIndex, videos, videoRefs, onPlay]);

  // Toggle mute function
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Manual play attempt
  const attemptPlay = (videoId: string) => {
    const videoElement = videoRefs.current[videoId];
    if (!videoElement) return;
    
    // Try playing
    const playPromise = videoElement.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setPlaybackError(null);
          if (onPlay) onPlay(videoId);
        })
        .catch(error => {
          console.error('Manual play attempt failed:', error);
          setPlaybackError('Video playback failed. Please try again.');
        });
    }
  };

  return { 
    isMuted, 
    setIsMuted, 
    isPlaying, 
    playbackError,
    toggleMute,
    attemptPlay
  };
}

// src/hooks/useVerticalSwipe.ts
import { useState, useRef, useCallback } from 'react';

interface SwipeOptions {
  threshold?: number;
  touchSensitivity?: number;
  wheelSensitivity?: number;
  maxTouchTime?: number;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeProgress?: (progress: number) => void;
}

export function useVerticalSwipe({
  threshold = 50,
  touchSensitivity = 0.8,
  wheelSensitivity = 0.5,
  maxTouchTime = 300,
  onSwipeUp,
  onSwipeDown,
  onSwipeProgress
}: SwipeOptions = {}) {
  // State
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const lastSwipeYRef = useRef(0);
  const touchVelocityRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset swipe progress
  const resetSwipeProgress = useCallback(() => {
    setSwipeProgress(0);
    if (onSwipeProgress) onSwipeProgress(0);
  }, [onSwipeProgress]);

  // Process swipe with velocity and distance
  const processSwipe = useCallback((delta: number, isTouch = false) => {
    if (isLocked) return;

    // Calculate progress
    const sensitivity = isTouch ? touchSensitivity : wheelSensitivity;
    const newProgress = swipeProgress + (delta * sensitivity);
    
    // Update progress
    setSwipeProgress(newProgress);
    if (onSwipeProgress) onSwipeProgress(newProgress);
    
    // Check if threshold is passed
    if (Math.abs(newProgress) > threshold) {
      // Lock to prevent multiple triggers
      setIsLocked(true);
      
      // Trigger appropriate callback
      if (newProgress > 0 && onSwipeUp) {
        onSwipeUp();
      } else if (newProgress < 0 && onSwipeDown) {
        onSwipeDown();
      }
      
      // Reset after animation should be complete
      if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = setTimeout(() => {
        resetSwipeProgress();
        setIsLocked(false);
      }, 500);
    } else {
      // If not past threshold, schedule a reset
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => {
        resetSwipeProgress();
      }, 150);
    }
  }, [
    isLocked, swipeProgress, threshold, touchSensitivity, 
    wheelSensitivity, onSwipeProgress, onSwipeUp, onSwipeDown, 
    resetSwipeProgress
  ]);

  // Wheel event handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    processSwipe(e.deltaY, false);
  }, [processSwipe]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isLocked) return;
    
    const touchY = e.touches[0].clientY;
    setTouchStartY(touchY);
    setTouchStartTime(Date.now());
    lastSwipeYRef.current = touchY;
    lastMoveTimeRef.current = Date.now();
    touchVelocityRef.current = 0;
  }, [isLocked]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isLocked || touchStartY === null) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = lastSwipeYRef.current - currentY;
    lastSwipeYRef.current = currentY;
    
    // Calculate velocity for momentum
    const now = Date.now();
    const deltaTime = now - lastMoveTimeRef.current;
    if (deltaTime > 0) {
      touchVelocityRef.current = deltaY / deltaTime;
    }
    lastMoveTimeRef.current = now;
    
    processSwipe(deltaY, true);
  }, [isLocked, touchStartY, processSwipe]);

  const handleTouchEnd = useCallback(() => {
    if (isLocked || touchStartY === null || touchStartTime === null) return;
    
    const touchDuration = Date.now() - touchStartTime;
    
    // Add momentum effect for fast swipes
    if (touchDuration < maxTouchTime && Math.abs(touchVelocityRef.current) > 0.3) {
      // Boost the momentum effect for quick swipes
      const momentumBoost = Math.sign(touchVelocityRef.current) * 
        Math.min(Math.abs(touchVelocityRef.current) * 200, threshold * 1.5);
      
      processSwipe(momentumBoost, true);
    }
    
    // Reset touch state
    setTouchStartY(null);
    setTouchStartTime(null);
  }, [isLocked, touchStartY, touchStartTime, maxTouchTime, threshold, processSwipe]);

  // Clean up timeouts
  const cleanup = useCallback(() => {
    if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
  }, []);

  return {
    swipeProgress,
    isLocked,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetSwipeProgress,
    cleanup
  };
}

// src/hooks/useDoubleTap.ts
import { useRef, useState, useCallback } from 'react';

interface DoubleTapOptions {
  onDoubleTap: (x: number, y: number) => void;
  maxDelayMs?: number;
}

export function useDoubleTap({ onDoubleTap, maxDelayMs = 300 }: DoubleTapOptions) {
  const lastTapRef = useRef(0);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  
  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const currentTime = Date.now();
    const tapLength = currentTime - lastTapRef.current;
    
    // Get tap coordinates
    let x = 0, y = 0;
    
    if ('touches' in e) {
      // Touch event
      if (e.touches.length === 0) return; // No touches
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      // Mouse event
      x = e.clientX;
      y = e.clientY;
    }
    
    // Check if it's a double tap
    if (tapLength < maxDelayMs && tapLength > 0) {
      // It's a double tap
      onDoubleTap(x, y);
      // Reset to prevent triple tap registering as double tap
      lastTapRef.current = 0;
    } else {
      // It's a single tap - store for potential double tap
      lastTapRef.current = currentTime;
      lastXRef.current = x;
      lastYRef.current = y;
    }
  }, [onDoubleTap, maxDelayMs]);
  
  return { handleTap };
}
