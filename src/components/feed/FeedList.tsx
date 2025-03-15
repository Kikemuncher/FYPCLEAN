"use client";

import { useEffect, useRef, useState } from "react";
import VideoCard from "./VideoCard";
import { useVideoStore } from "@/store/videoStore";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);

  // Ref for load more trigger
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0.1,
  });

  // Load initial videos
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Load more videos when approaching end
  useEffect(() => {
    if (loadMoreInView && videos.length > 0 && hasMore && !loading) {
      fetchMoreVideos();
    }
  }, [loadMoreInView, fetchMoreVideos, videos.length, hasMore, loading]);

  // Make videos globally available for VideoCard transition
  useEffect(() => {
    window.currentVideoIndex = currentVideoIndex;
  }, [currentVideoIndex]);

  // TikTok-style swipe with improved performance
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
    const minSwipeDistance = 40; // More sensitive TikTok-like swiping
    
    if (distance > minSwipeDistance && currentVideoIndex < videos.length - 1) {
      // Swipe up - next video
      handleScroll('down');
    } else if (distance < -minSwipeDistance && currentVideoIndex > 0) {
      // Swipe down - previous video
      handleScroll('up');
    }
    
    // Reset touch values
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Smoother scroll handling for wheel/arrow navigation
  const handleScroll = (direction: 'up' | 'down') => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    setScrollDirection(direction);
    
    if (direction === 'down' && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (direction === 'up' && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
    
    // Allow scrolling again after animation plus a small buffer
    setTimeout(() => {
      setIsScrolling(false);
      setScrollDirection(null);
    }, 350);
  };

  // Wheel event handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (isScrolling) return;
    
    if (e.deltaY > 0 && currentVideoIndex < videos.length - 1) {
      handleScroll('down');
    } else if (e.deltaY < 0 && currentVideoIndex > 0) {
      handleScroll('up');
    }
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
        <div className="relative w-full h-full">
          {/* Only render active video and adjacent videos for performance */}
          {videos.map((video, index) => {
            if (index >= currentVideoIndex - 1 && index <= currentVideoIndex + 1) {
              return (
                <VideoCard 
                  key={video.id} 
                  video={video} 
                  isActive={index === currentVideoIndex}
                  index={index}
                  onNavigateNext={() => handleScroll('down')}
                  onNavigatePrev={() => handleScroll('up')}
                />
              );
            }
            return null;
          })}
        </div>
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
