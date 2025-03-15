// Rendering logic - with proper conditional rendering
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <p className="text-white">No videos available</p>
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
      {/* Main feed container with smooth transitions */}
      <motion.div 
        className="absolute w-full"
        style={{ height: containerHeight * videos.length }}
        animate={{ 
          y: -currentVideoIndex * containerHeight + swipeProgress 
        }}
        transition={{ 
          y: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: isSwipeLocked ? 0.5 : 0.2
          }
        }}
      >
        {videos.map((video, index) => {
          // Only render videos that are close to the current one (performance optimization)
          const isVisible = Math.abs(index - currentVideoIndex) <= 1;
          const isActive = index === currentVideoIndex;
          
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
                <div className="relative w-full h-full overflow-hidden">
                  {/* Video element */}
                  <video
                    ref={el => videoRefs.current[video.id] = el}
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
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
                          src={video.userAvatar} 
                          alt={video.username} 
                          className="w-full h-full object-cover"
                          loading="lazy"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(video.id);
                      }}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </div>
                      <span className="text-white text-xs mt-1">{formatCount(video.saves)}</span>
                    </button>
                    
                    <button className="flex flex-col items-center">
                      <div className="rounded-full bg-black/20 p-2">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </div>
                      <span className="text-white text-xs mt-1">{formatCount(video.shares)}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>
      
      {/* Sound toggle button */}
      <button 
        onClick={(e) => {
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
        <span className="text-white text-sm">{currentVideoIndex + 1} / {videos.length}</span>
      </div>
      
      {/* Scroll guide indicator */}
      {videos.length > 1 && currentVideoIndex === 0 && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/30 px-3 py-1 rounded-full z-30 flex items-center">
          <span className="mr-2">Swipe up for more</span>
          <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      )}
    </div>
  );
}"use client";

import React, { useEffect, useState, useRef } from "react";
import { useVideoStore } from "@/store/videoStore";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedList() {
  // Store state
  const { videos, currentVideoIndex, setCurrentVideoIndex, fetchVideos, likeVideo, incrementView } = useVideoStore();
  
  // Local state
  const [isClient, setIsClient] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwipeLocked, setIsSwipeLocked] = useState(false);
  const [likedVideos, setLikedVideos] = useState({});
  
  const videoRefs = useRef({});
  const containerRef = useRef(null);
  
  // Initialize
  useEffect(() => {
    setIsClient(true);
    fetchVideos();
    
    // Set container height
    const updateHeight = () => {
      setContainerHeight(window.innerHeight);
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    // Add keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'k') {
        if (currentVideoIndex > 0) {
          setCurrentVideoIndex(currentVideoIndex - 1);
        }
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        if (currentVideoIndex < videos.length - 1) {
          setCurrentVideoIndex(currentVideoIndex + 1);
        }
      } else if (e.key === 'm') {
        setIsMuted(!isMuted);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fetchVideos, currentVideoIndex, videos.length, setCurrentVideoIndex, isMuted]);
  
  // Handle video playback when current index changes
  useEffect(() => {
    if (!isClient) return;

    // Pause all videos
    Object.values(videoRefs.current).forEach(videoRef => {
      if (videoRef && !videoRef.paused) {
        videoRef.pause();
      }
    });

    // Play current video
    const currentVideo = videoRefs.current[videos[currentVideoIndex]?.id];
    if (currentVideo) {
      currentVideo.currentTime = 0;
      
      const playPromise = currentVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Auto-play prevented, waiting for user interaction");
        });
      }
      
      // Track view
      if (videos[currentVideoIndex]?.id) {
        incrementView(videos[currentVideoIndex].id);
      }
    }
  }, [currentVideoIndex, videos, isClient, incrementView]);
  
  // Toggle mute function
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Format numbers for display
  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };
  
  // Handle wheel event for scrolling
  const handleWheel = (e) => {
    e.preventDefault();
    
    if (isSwipeLocked) return;
    
    // Apply a multiplier for more sensitive scrolling
    const delta = e.deltaY * 0.5;
    
    // Update progress for visual feedback
    let newProgress = swipeProgress + delta;
    
    // Apply resistance at the ends
    if ((currentVideoIndex === 0 && newProgress < 0) || 
        (currentVideoIndex === videos.length - 1 && newProgress > 0)) {
      newProgress = newProgress * 0.3;
    }
    
    setSwipeProgress(newProgress);
    
    // Check if we've crossed the threshold to change videos
    if (Math.abs(newProgress) > 50) {
      setIsSwipeLocked(true);
      
      if (newProgress > 0 && currentVideoIndex < videos.length - 1) {
        // Go to next video
        setCurrentVideoIndex(currentVideoIndex + 1);
      } else if (newProgress < 0 && currentVideoIndex > 0) {
        // Go to previous video
        setCurrentVideoIndex(currentVideoIndex - 1);
      }
      
      // Reset after animation
      setTimeout(() => {
        setSwipeProgress(0);
        setIsSwipeLocked(false);
      }, 400);
    }
  };
  
  // Handle touch events for mobile
  const touchStartY = useRef(0);
  const touchMoveY = useRef(0);
  
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchMoveY.current = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e) => {
    if (isSwipeLocked) return;
    
    const currentY = e.touches[0].clientY;
    const diff = touchMoveY.current - currentY;
    touchMoveY.current = currentY;
    
    // Similar logic to wheel handler but with different sensitivity
    const delta = diff * 0.8;
    let newProgress = swipeProgress + delta;
    
    if ((currentVideoIndex === 0 && newProgress < 0) || 
        (currentVideoIndex === videos.length - 1 && newProgress > 0)) {
      newProgress = newProgress * 0.3;
    }
    
    setSwipeProgress(newProgress);
    
    if (Math.abs(newProgress) > 50) {
      setIsSwipeLocked(true);
      
      if (newProgress > 0 && currentVideoIndex < videos.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
      } else if (newProgress < 0 && currentVideoIndex > 0) {
        setCurrentVideoIndex(currentVideoIndex - 1);
      }
      
      setTimeout(() => {
        setSwipeProgress(0);
        setIsSwipeLocked(false);
      }, 400);
    }
  };
  
  const handleTouchEnd = () => {
    // Reset progress if threshold not crossed
    if (!isSwipeLocked) {
      setSwipeProgress(0);
    }
  };
  
  // Double tap to like
  const lastTap = useRef(0);
  const handleDoubleTap = () => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap.current;
    
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      const currentVideoId = videos[currentVideoIndex]?.id;
      if (currentVideoId) {
        // Update like status
        setLikedVideos(prev => ({
          ...prev,
          [currentVideoId]: true
        }));
        
        likeVideo(currentVideoId);
      }
    }
    
    lastTap.current = currentTime;
  };
  
  // Handle toggling like directly (not via double tap)
  const toggleLike = (videoId) => {
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
    
    likeVideo(videoId);
  };
