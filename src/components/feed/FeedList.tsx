"use client";

import { useEffect, useRef, useState } from "react";
import VideoCard from "./VideoCard";
import { useVideoStore } from "@/store/videoStore";
import { useInView } from "react-intersection-observer";

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

  // Threshold for swipe detection (in pixels)
  const minSwipeDistance = 50;

  // Improved swipe handling with debounce
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isScrolling) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;
    
    if (isUpSwipe && currentVideoIndex < videos.length - 1) {
      setIsScrolling(true);
      setCurrentVideoIndex(currentVideoIndex + 1);
      
      // Allow scrolling again after animation completes
      setTimeout(() => setIsScrolling(false), 400);
    } else if (isDownSwipe && currentVideoIndex > 0) {
      setIsScrolling(true);
      setCurrentVideoIndex(currentVideoIndex - 1);
      
      // Allow scrolling again after animation completes
      setTimeout(() => setIsScrolling(false), 400);
    }
    
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Improved wheel event for desktop with debounce
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (isScrolling) return;
    
    if (e.deltaY > 0 && currentVideoIndex < videos.length - 1) {
      setIsScrolling(true);
      setCurrentVideoIndex(currentVideoIndex + 1);
      
      // Allow scrolling again after animation completes
      setTimeout(() => setIsScrolling(false), 400);
    } else if (e.deltaY < 0 && currentVideoIndex > 0) {
      setIsScrolling(true);
      setCurrentVideoIndex(currentVideoIndex - 1);
      
      // Allow scrolling again after animation completes
      setTimeout(() => setIsScrolling(false), 400);
    }
  };

  // Consistent navigation behavior for buttons
  const handleNavigateNext = () => {
    if (isScrolling || currentVideoIndex >= videos.length - 1) return;
    
    setIsScrolling(true);
    setCurrentVideoIndex(currentVideoIndex + 1);
    
    // Allow scrolling again after animation completes
    setTimeout(() => setIsScrolling(false), 400);
  };

  const handleNavigatePrev = () => {
    if (isScrolling || currentVideoIndex <= 0) return;
    
    setIsScrolling(true);
    setCurrentVideoIndex(currentVideoIndex - 1);
    
    // Allow scrolling again after animation completes
    setTimeout(() => setIsScrolling(false), 400);
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black"
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
        // Add gap between videos that connects them
        <div className="relative w-full h-full">
          {videos.map((video, index) => (
            <VideoCard 
              key={video.id} 
              video={video} 
              isActive={index === currentVideoIndex}
              index={index}
              onNavigateNext={handleNavigateNext}
              onNavigatePrev={handleNavigatePrev}
            />
          ))}
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
      
      {/* Improved loading indicator with animation */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="h-16 w-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-t-white border-r-white border-b-transparent border-l-transparent"></div>
          </div>
        </div>
      )}
    </div>
  );
}
