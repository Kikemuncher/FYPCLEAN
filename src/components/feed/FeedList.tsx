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

function FeedList(): JSX.Element {
  // Format function for numbers
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  // Current active video
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  
  // Track likes
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  
  // Video playing state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true); // Start paused
  
  // Container height
  const [containerHeight, setContainerHeight] = useState<number>(0);
  
  // For tactile scrolling
  const [offset, setOffset] = useState<number>(0);
  
  // Last tap for double tap detection
  const lastTap = useRef<number>(0);
  
  // Video element references
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const videoTimeRefs = useRef<Record<string, number>>({});
  
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
  }, [currentVideoIndex, isPaused]);
  
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
  
  // Go to next video with improved immediate response
  const goToNextVideo = () => {
    if (currentVideoIndex < VIDEOS.length - 1) {
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
            className="absolute w-full transition-transform duration-300 ease-out"
            style={{ 
              height: containerHeight * VIDEOS.length,
              transform: `translateY(${-currentVideoIndex * containerHeight + offset}px)`,
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="
