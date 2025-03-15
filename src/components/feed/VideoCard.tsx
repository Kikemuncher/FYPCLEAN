"use client";

import { useEffect, useRef, useState } from "react";
import { useVideoStore } from "@/store/videoStore";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

// Single container component for the whole feed
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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRefs = useRef<any[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [videoHeight, setVideoHeight] = useState(0);
  
  // Load initial videos
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);
  
  // Update video height based on screen size
  useEffect(() => {
    setVideoHeight(window.innerHeight);
    
    const handleResize = () => {
      setVideoHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Load more videos when reaching near the end
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0.1,
  });
  
  useEffect(() => {
    if (loadMoreInView && videos.length > 0 && hasMore && !loading) {
      fetchMoreVideos();
    }
  }, [loadMoreInView, fetchMoreVideos, videos.length, hasMore, loading]);
  
  // Handle touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isScrolling) return;
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isScrolling || !touchStart) return;
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isScrolling) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 40;
    
    if (distance > minSwipeDistance && currentVideoIndex < videos.length - 1) {
      navigateToIndex(currentVideoIndex + 1);
    } else if (distance < -minSwipeDistance && currentVideoIndex > 0) {
      navigateToIndex(currentVideoIndex - 1);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };
  
  // Handle mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (isScrolling) return;
    
    if (e.deltaY > 0 && currentVideoIndex < videos.length - 1) {
      navigateToIndex(currentVideoIndex + 1);
    } else if (e.deltaY < 0 && currentVideoIndex > 0) {
      navigateToIndex(currentVideoIndex - 1);
    }
  };
  
  // Navigate to specific index with debouncing
  const navigateToIndex = (index: number) => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    setCurrentVideoIndex(index);
    
    setTimeout(() => {
      setIsScrolling(false);
    }, 400);
  };
  
  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Set up player refs
  const setPlayerRef = (index: number, ref: any) => {
    playerRefs.current[index] = ref;
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {videos.length === 0 && !loading ? (
        <div className="flex h-full w-full items-center justify-center text-white">
          <p>No videos available.</p>
        </div>
      ) : (
        <motion.div 
          className="relative w-full"
          style={{ 
            height: videoHeight * videos.length,
            y: -currentVideoIndex * videoHeight
          }}
          animate={{ y: -currentVideoIndex * videoHeight }}
          transition={{ 
            duration: 0.4, 
            ease: [0.16, 1, 0.3, 1] 
          }}
        >
          {videos.map((video, index) => {
            // Only render visible and adjacent videos
            if (Math.abs(index - currentVideoIndex) > 1) return null;
            
            const isActive = index === currentVideoIndex;
            
            return (
              <div
                key={video.id}
                className="absolute left-0 w-full"
                style={{ 
                  height: videoHeight,
                  top: index * videoHeight
                }}
              >
                {/* Video player */}
                <div className="relative w-full h-full bg-black">
                  {/* Video content */}
                  <div className="absolute inset-0">
                    {isActive && (
                      <video
                        ref={(ref) => setPlayerRef(index, ref)}
                        src={video.videoUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        loop
                        muted={false}
                      />
                    )}
                  </div>
                  
                  {/* Video info overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="mb-2">
                      <p className="font-bold text-white">@{video.username}</p>
                      <p className="text-white text-sm">{video.caption}</p>
                    </div>
                  </div>
                  
                  {/* Side actions - compact spacing */}
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
                  
                  {/* Navigation buttons */}
                  <div className="absolute left-4 bottom-20 flex flex-col space-y-3 z-30">
                    <button 
                      onClick={() => currentVideoIndex > 0 && navigateToIndex(currentVideoIndex - 1)}
                      className={`bg-black/50 hover:bg-black/70 text-white rounded-full p-2 ${currentVideoIndex === 0 ? 'opacity-50' : 'opacity-100'}`}
                      disabled={currentVideoIndex === 0 || isScrolling}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => currentVideoIndex < videos.length - 1 && navigateToIndex(currentVideoIndex + 1)}
                      className={`bg-black/50 hover:bg-black/70 text-white rounded-full p-2 ${currentVideoIndex === videos.length - 1 ? 'opacity-50' : 'opacity-100'}`}
                      disabled={currentVideoIndex === videos.length - 1 || isScrolling}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
      
      {/* Load more trigger */}
      {hasMore && (
        <div 
          ref={loadMoreRef} 
          className="absolute opacity-0 pointer-events-none"
          style={{ bottom: 20 }}
        />
      )}
      
      {/* Loading indicator */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/30 z-50"
          >
            <div className="h-12 w-12">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-2 border-t-white border-r-white border-b-transparent border-l-transparent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
