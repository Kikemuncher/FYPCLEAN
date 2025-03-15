"use client";

import { useEffect, useRef, useState } from "react";
import { useVideoStore } from "@/store/videoStore";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

export default function FeedList() {
  const { 
    videos, 
    currentVideoIndex, 
    setCurrentVideoIndex, 
    fetchVideos,
    fetchMoreVideos,
    loading,
    hasMore 
  } = useVideoStore();
  
  const feedRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const [videoRefs, setVideoRefs] = useState<{[key: string]: HTMLVideoElement | null}>({});
  const [isClient, setIsClient] = useState(false);

  // Only run client-side code after mount
  useEffect(() => {
    setIsClient(true);
    setWindowHeight(window.innerHeight);
    
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load videos on mount
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Handle playing the current video
  useEffect(() => {
    if (!isClient) return;
    
    // Pause all videos
    Object.values(videoRefs).forEach(video => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });
    
    // Play the current video
    const currentVideo = videoRefs[`video-${currentVideoIndex}`];
    if (currentVideo) {
      try {
        const playPromise = currentVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Auto-play was prevented, add a play button or user interaction
            console.log("Autoplay prevented");
          });
        }
      } catch (err) {
        console.error("Error playing video:", err);
      }
    }
  }, [currentVideoIndex, videoRefs, isClient]);

  // Load more videos when needed
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0.1,
  });
  
  useEffect(() => {
    if (loadMoreInView && videos.length > 0 && hasMore && !loading) {
      fetchMoreVideos();
    }
  }, [loadMoreInView, fetchMoreVideos, videos.length, hasMore, loading]);
  
  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
    setIsDragging(true);
    setTouchDelta(0);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentTouch = e.touches[0].clientY;
    const delta = touchStart - currentTouch;
    setTouchDelta(delta);
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Determine if we should navigate
    if (Math.abs(touchDelta) > 80) {
      if (touchDelta > 0 && currentVideoIndex < videos.length - 1) {
        // Swipe up - next video
        setCurrentVideoIndex(currentVideoIndex + 1);
      } else if (touchDelta < 0 && currentVideoIndex > 0) {
        // Swipe down - previous video
        setCurrentVideoIndex(currentVideoIndex - 1);
      }
    }
    
    setTouchDelta(0);
  };
  
  // Mouse wheel handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (e.deltaY > 20 && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (e.deltaY < -20 && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };
  
  // Register video refs
  const setVideoRef = (index: number, el: HTMLVideoElement | null) => {
    setVideoRefs(prev => ({
      ...prev,
      [`video-${index}`]: el
    }));
  };
  
  // Get y position offset for the feed
  const getFeedY = () => {
    if (isDragging) {
      // During drag, allow some resistance
      const dragAmount = -currentVideoIndex * windowHeight - touchDelta * 0.3;
      return dragAmount;
    }
    return -currentVideoIndex * windowHeight;
  };
  
  // If not client-side yet, show loading
  if (!isClient) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="h-14 w-14">
          <div className="animate-spin rounded-full h-14 w-14 border-2 border-t-white border-r-white border-b-transparent border-l-transparent"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="fixed inset-0 bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <motion.div
        ref={feedRef}
        className="absolute inset-0 w-full"
        style={{ y: getFeedY() }}
        animate={{ y: -currentVideoIndex * windowHeight }}
        transition={{ 
          type: "spring",
          duration: 0.5,
          bounce: 0.1,
          damping: 20
        }}
      >
        {videos.map((video, index) => (
          <div 
            key={video.id}
            className="absolute top-0 left-0 w-full h-screen"
            style={{ top: `${index * 100}vh` }}
          >
            {/* Video Player */}
            <video
              ref={el => setVideoRef(index, el)}
              src={video.videoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              loop
              muted={false}
              preload="auto"
              poster="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
            />
            
            {/* Video Info */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
              <div className="mb-2">
                <p className="font-bold text-white">@{video.username}</p>
                <p className="text-white text-sm">{video.caption}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-3">
              <button className="flex flex-col items-center">
                <div className="rounded-full bg-transparent p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white text-xs">0</span>
              </button>
              
              <button className="flex flex-col items-center">
                <div className="rounded-full bg-transparent p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white text-xs">0</span>
              </button>
              
              <button className="flex flex-col items-center">
                <div className="rounded-full bg-transparent p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                </div>
                <span className="text-white text-xs">0</span>
              </button>
              
              <button className="flex flex-col items-center">
                <div className="rounded-full bg-transparent p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                </div>
                <span className="text-white text-xs">0</span>
              </button>
            </div>
            
            {/* Navigation Buttons */}
            <div className="absolute left-2 bottom-20 flex flex-col space-y-3 z-30">
              <button 
                onClick={() => currentVideoIndex > 0 && setCurrentVideoIndex(currentVideoIndex - 1)}
                className={`bg-black/50 hover:bg-black/70 text-white rounded-full p-2 ${currentVideoIndex === 0 ? 'opacity-50' : 'opacity-100'}`}
                disabled={currentVideoIndex === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                onClick={() => currentVideoIndex < videos.length - 1 && setCurrentVideoIndex(currentVideoIndex + 1)}
                className={`bg-black/50 hover:bg-black/70 text-white rounded-full p-2 ${currentVideoIndex === videos.length - 1 ? 'opacity-50' : 'opacity-100'}`}
                disabled={currentVideoIndex === videos.length - 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </motion.div>
      
      {/* Load more trigger */}
      {hasMore && (
        <div 
          ref={loadMoreRef} 
          className="absolute opacity-0 pointer-events-none"
          style={{ bottom: 20 }}
        />
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="h-14 w-14">
            <div className="animate-spin rounded-full h-14 w-14 border-2 border-t-white border-r-white border-b-transparent border-l-transparent"></div>
          </div>
        </div>
      )}
    </div>
  );
}
