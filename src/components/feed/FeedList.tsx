"use client";

import React, { useEffect, useState, useRef } from "react";
import { useVideoStore } from "@/store/videoStore";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedList() {
  const { videos, currentVideoIndex, setCurrentVideoIndex, fetchVideos } = useVideoStore();
  const [isClient, setIsClient] = useState(false);
  const videoRefs = useRef<HTMLVideoElement[]>([]);
  const [isMuted, setIsMuted] = useState(false);

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
        const playPromise = videoRef.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Autoplay prevented:", error);
          });
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
  }, [currentVideoIndex, videos, isClient]);

  // Handle touch gestures for swiping
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (distance > minSwipeDistance && currentVideoIndex < videos.length - 1) {
      // Swipe up = next video
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (distance < -minSwipeDistance && currentVideoIndex > 0) {
      // Swipe down = previous video
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Handle wheel events for desktop scrolling
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (e.deltaY > 0 && currentVideoIndex < videos.length - 1) {
      // Scroll down = next video
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (e.deltaY < 0 && currentVideoIndex > 0) {
      // Scroll up = previous video
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  // Set video refs for controlling play/pause
  const setVideoRef = (el: HTMLVideoElement | null, index: number) => {
    if (el) {
      videoRefs.current[index] = el;
    }
  };

  // Toggle video mute state
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Handle server-side rendering gracefully
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Show fallback if no videos are available
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
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Full-height container that moves up and down */}
      <motion.div 
        className="absolute w-full"
        style={{ height: `${videos.length * 100}vh` }}
        animate={{ y: `-${currentVideoIndex * 100}vh` }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.6
        }}
      >
        {/* Render all videos in position */}
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            className="absolute w-full h-screen"
            style={{ top: `${index * 100}vh` }}
          >
            {/* Video element */}
            <video
              ref={(el) => setVideoRef(el, index)}
              src={video.videoUrl}
              className="w-full h-full object-cover"
              loop
              playsInline
              muted={isMuted}
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
            
            {/* Navigation buttons */}
            <div className="absolute left-2 bottom-20 flex flex-col space-y-3 z-30">
              <button 
                onClick={() => currentVideoIndex > 0 && setCurrentVideoIndex(currentVideoIndex - 1)}
                className={`bg-black/50 hover:bg-black/70 text-white rounded-full p-2 ${currentVideoIndex === 0 ? 'opacity-50' : 'opacity-100'}`}
                disabled={currentVideoIndex === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button 
                onClick={() => currentVideoIndex < videos.length - 1 && setCurrentVideoIndex(currentVideoIndex + 1)}
                className={`bg-black/50 hover:bg-black/70 text-white rounded-full p-2 ${currentVideoIndex === videos.length - 1 ? 'opacity-50' : 'opacity-100'}`}
                disabled={currentVideoIndex === videos.length - 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="absolute top-4 right-4 bg-black/30 rounded-full p-2"
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
          </div>
        ))}
      </motion.div>

      {/* Video progress indicator */}
      <div className="absolute top-2 left-0 right-0 z-40 flex justify-center">
        <div className="flex space-x-1">
          {videos.map((_, index) => (
            <div 
              key={index} 
              className={`h-1 rounded-full ${
                index === currentVideoIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
              } transition-all duration-300`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
