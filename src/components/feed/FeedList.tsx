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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'k') {
        goToPrevVideo();
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        goToNextVideo();
      } else if (e.key === 'm') {
        toggleMute();
      } else if (e.key === 'l') {
        const currentVideoId = videos[currentVideoIndex]?.id;
        if (currentVideoId) {
          toggleLike(currentVideoId);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Add haptic feedback support for mobile
    const handleVisibilityChange = () => {
      // When tab becomes visible again, reset video playback
      if (document.visibilityState === 'visible') {
        const currentVideo = videoRefs.current[videos[currentVideoIndex]?.id];
        if (currentVideo) {
          attemptPlay(videos[currentVideoIndex].id);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanupSwipe();
    };
  }, [
    fetchVideos, 
    goToNextVideo, 
    goToPrevVideo, 
    toggleMute, 
    toggleLike, 
    cleanupSwipe, 
    videos, 
    currentVideoIndex,
    attemptPlay
  ]);

  // Format numbers for display
  const formatCount = useCallback((count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }, []);

  // Loading state
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // No videos state
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
      onClick={handleTap}
      role="region"
      aria-label="Video feed"
      aria-roledescription="carousel"
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
              aria-hidden={!isActive}
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
                    poster={isActive ? undefined : "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="}
                    onClick={isActive ? () => attemptPlay(video.id) : undefined}
                    aria-label={`Video by ${video.username}: ${video.caption}`}
                  />
                  
                  {/* Playback error message */}
                  {isActive && playbackError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div 
                        className="bg-black/80 rounded-lg p-4 max-w-xs text-center"
                        onClick={() => attemptPlay(video.id)}
                      >
                        <p className="text-white">{playbackError}</p>
                        <button className="mt-2 bg-white text-black px-4 py-2 rounded-full text-sm">
                          Tap to play
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Double-tap heart animation */}
                  <AnimatePresence>
                    {showLikeAnimation && isActive && (
                      <motion.div 
                        className="absolute pointer-events-none"
                        style={{
                          left: likeAnimPosition.x - 50,
                          top: likeAnimPosition.y - 50,
                        }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg className="w-24 h-24 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
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
                      aria-label={likedVideos[video.id] ? "Unlike video" : "Like video"}
                      aria-pressed={likedVideos[video.id]}
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
                    
                    <button className="flex flex-col items-center"
                      aria-label="Comment on video">
                      <div className="rounded-full bg-black/20 p-2">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <span className="text-white text-xs mt-1">{formatCount(video.comments)}</span>
                    </button>
                    
                    <button 
                      className="flex flex-col items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveVideo(video.id);
                      }}
                      aria-label="Save video"
                    >
                      <div className="rounded-full bg-black/20 p-2">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </div>
                      <span className="text-white text-xs mt-1">{formatCount(video.saves)}</span>
                    </button>
                    
                    <button 
                      className="flex flex-col items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareVideo(video.id);
                      }}
                      aria-label="Share video"
                    >
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
        aria-label={isMuted ? "Unmute video" : "Mute video"}
        aria-pressed={isMuted}
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
      
      {/* Scroll guide indicator (only shows when needed) */}
      <AnimatePresence>
        {videos.length > 1 && currentVideoIndex === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/30 px-3 py-1 rounded-full z-30 flex items-center"
          >
            <span className="mr-2">Swipe up for more</span>
            <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Keyboard shortcuts help - show when pressing ? key */}
      <AnimatePresence>
        {isClient && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded z-30"
          >
            <span className="text-tiktok-blue">Tip:</span> Use ↑/↓ or J/K to navigate, M to mute, L to like
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useVideoStore } from "@/store/videoStore";
import { motion, AnimatePresence } from "framer-motion";
import { VideoData } from "@/types/video";
import { useVideoPlayback } from "@/hooks/useVideoPlayback";
import { useVerticalSwipe } from "@/hooks/useVerticalSwipe";
import { useDoubleTap } from "@/hooks/useDoubleTap";

export default function FeedList() {
  // Store state
  const { 
    videos, 
    currentVideoIndex, 
    setCurrentVideoIndex, 
    fetchVideos,
    likeVideo, 
    unlikeVideo,
    incrementView,
    shareVideo,
    saveVideo
  } = useVideoStore();
  
  // Local state
  const [isClient, setIsClient] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [likeAnimPosition, setLikeAnimPosition] = useState({ x: 0, y: 0 });
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks
  const { 
    isMuted, 
    toggleMute, 
    isPlaying, 
    playbackError, 
    attemptPlay 
  } = useVideoPlayback(videoRefs, currentVideoIndex, videos, (videoId) => {
    // Track view when video plays
    incrementView(videoId);
  });
  
  // Navigation handlers
  const goToNextVideo = useCallback(() => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  }, [currentVideoIndex, videos.length, setCurrentVideoIndex]);

  const goToPrevVideo = useCallback(() => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  }, [currentVideoIndex, setCurrentVideoIndex]);
  
  // Swipe handlers with progress feedback
  const { 
    swipeProgress,
    isLocked: isSwipeLocked,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    cleanup: cleanupSwipe
  } = useVerticalSwipe({
    onSwipeUp: goToNextVideo,
    onSwipeDown: goToPrevVideo,
    threshold: 50,
    touchSensitivity: 0.8,
    wheelSensitivity: 0.4
  });
  
  // Double tap handler
  const handleDoubleTap = useCallback((x: number, y: number) => {
    const currentVideoId = videos[currentVideoIndex]?.id;
    if (!currentVideoId) return;
    
    // Set animation position centered on tap point
    setLikeAnimPosition({ x, y });
    
    // Add like if not already liked
    if (!likedVideos[currentVideoId]) {
      setLikedVideos(prev => ({
        ...prev,
        [currentVideoId]: true
      }));
      likeVideo(currentVideoId);
    }
    
    // Show animation
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
  }, [currentVideoIndex, videos, likedVideos, likeVideo]);
  
  // Use double tap hook
  const { handleTap } = useDoubleTap({
    onDoubleTap: handleDoubleTap
  });
  
  // Toggle like directly (not via double tap)
  const toggleLike = useCallback((videoId: string) => {
    const isCurrentlyLiked = likedVideos[videoId];
    
    // Update local state
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: !isCurrentlyLiked
    }));
    
    // Update store
    if (isCurrentlyLiked) {
      unlikeVideo(videoId);
    } else {
      likeVideo(videoId);
    }
  }, [likedVideos, likeVideo, unlikeVideo]);
