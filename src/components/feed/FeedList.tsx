"use client";

import React, { useEffect, useState, useRef } from "react";
import { useVideoStore } from "@/store/videoStore";
import { motion } from "framer-motion";

export default function FeedList() {
  const { videos, currentVideoIndex, setCurrentVideoIndex, fetchVideos } = useVideoStore();
  const [isClient, setIsClient] = useState(false);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const lastNavigationTime = useRef(0);

  // Only run after component mounts (client-side)
  useEffect(() => {
    setIsClient(true);
    fetchVideos();
  }, [fetchVideos]);

  // Focus on current video: play current, pause others
  useEffect(() => {
    if (!isClient || videos.length === 0) return;

    // First pause all videos
    videoRefs.current.forEach((videoRef, index) => {
      if (!videoRef) return;
      
      if (index === currentVideoIndex) {
        // Play the current video
        try {
          const playPromise = videoRef.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log("Autoplay prevented:", error);
            });
          }
        } catch (error) {
          console.error("Error playing video:", error);
        }
      } else {
        // Pause all other videos
        try {
          videoRef.pause();
          videoRef.currentTime = 0;
        } catch (error) {
          console.log("Error pausing video:", error);
        }
      }
    });

    // Allow scrolling again after animation completes but with a delay
    setTimeout(() => {
      setIsScrolling(false);
    }, 800);
  }, [currentVideoIndex, videos, isClient]);

  // Navigation function with rate limiting
  const navigateToVideo = (direction: 'prev' | 'next') => {
    // Rate limiting - prevent rapid navigation
    const now = Date.now();
    if (now - lastNavigationTime.current < 800 || isScrolling) {
      return;
    }
    
    lastNavigationTime.current = now;
    setIsScrolling(true);
    
    if (direction === 'next' && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (direction === 'prev' && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    } else {
      setIsScrolling(false);
    }
  };

  // VERY SIMPLE KEYBOARD NAVIGATION
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        navigateToVideo('prev');
      } else if (e.key === 'ArrowDown') {
        navigateToVideo('next');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, isScrolling]);

  // WHEEL HANDLER - Simple but rate-limited
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (e.deltaY > 40) {
      navigateToVideo('next');
    } else if (e.deltaY < -40) {
      navigateToVideo('prev');
    }
  };

  // TOUCH HANDLER - Simple but effective
  const touchStartRef = useRef(0);
  const touchMoveEnabled = useRef(true);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientY;
    touchMoveEnabled.current = true;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchMoveEnabled.current || isScrolling) return;
    
    const currentY = e.touches[0].clientY;
    const diff = touchStartRef.current - currentY;
    
    // If substantial movement, navigate and disable further movement until touchend
    if (Math.abs(diff) > 60) {
      touchMoveEnabled.current = false;
      
      if (diff > 0) {
        navigateToVideo('next');
      } else {
        navigateToVideo('prev');
      }
    }
  };

  // Set video refs
  const setVideoRef = (el: HTMLVideoElement | null, index: number) => {
    if (el) {
      videoRefs.current[index] = el;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Server-side rendering fallback
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // No videos fallback
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <p className="text-white">No videos available</p>
      </div>
    );
  }

  return (
    <div 
      className="h-screen w-full overflow-hidden bg-black relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onWheel={handleWheel}
    >
      {/* Full-height container that moves up and down */}
      <motion.div 
        className="absolute w-full"
        style={{ height: `${videos.length * 100}vh` }}
        animate={{ y: `-${currentVideoIndex * 100}vh` }}
        transition={{ 
          duration: 0.7,
          ease: [0.32, 0.72, 0.24, 0.99]  // Nice smooth custom easing
        }}
      >
        {/* Render all videos in position */}
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            className="absolute w-full h-screen"
            style={{ top: `${index * 100}vh` }}
          >
            {/* Only render videos that are close to the current one for performance */}
            {Math.abs(index - currentVideoIndex) <= 1 && (
              <>
                {/* Video element */}
                <video
                  ref={(el) => setVideoRef(el, index)}
                  src={video.videoUrl}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  muted={isMuted}
                  controls={false}
                  poster="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                />
                
                {/* Video info */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="font-bold text-white">@{video.username}</p>
                  <p className="text-white text-sm">{video.caption}</p>
                </div>
                
                {/* Action buttons */}
                <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-3">
                  <button className="flex flex-col items-center">
                    <div className="rounded-full bg-transparent p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <span className="text-white text-xs">0</span>
                  </button>
                  
                  <button className="flex flex-col items-center">
                    <div className="rounded-full bg-transparent p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span className="text-white text-xs">0</span>
                  </button>
                  
                  <button className="flex flex-col items-center">
                    <div className="rounded-full bg-transparent p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>
                    <span className="text-white text-xs">0</span>
                  </button>
                  
                  <button className="flex flex-col items-center">
                    <div className="rounded-full bg-transparent p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </div>
                    <span className="text-white text-xs">0</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </motion.div>

      {/* Navigation buttons - CENTERED VERSION */}
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-24 flex space-x-8 z-30">
        <button 
          onClick={() => navigateToVideo('prev')}
          className={`bg-black/50 hover:bg-black/70 text-white rounded-full p-3 ${
            currentVideoIndex === 0 || isScrolling ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
          }`}
          disabled={currentVideoIndex === 0 || isScrolling}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button 
          onClick={() => navigateToVideo('next')}
          className={`bg-black/50 hover:bg-black/70 text-white rounded-full p-3 ${
            currentVideoIndex === videos.length - 1 || isScrolling ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
          }`}
          disabled={currentVideoIndex === videos.length - 1 || isScrolling}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Sound toggle button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className="absolute top-4 right-4 bg-black/30 rounded-full p-2 z-30"
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* Video counter indicator */}
      <div className="absolute top-4 left-4 bg-black/30 rounded-full px-3 py-1 z-30">
        <span className="text-white text-sm">{currentVideoIndex + 1} / {videos.length}</span>
      </div>
    </div>
  );
}
