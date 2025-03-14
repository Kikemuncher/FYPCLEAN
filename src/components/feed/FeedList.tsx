"use client";

import { useEffect, useRef, useState } from "react";
import { useVideoStore } from "@/store/videoStore";
import { useInView } from "react-intersection-observer";
import { CircularProgress } from "@mui/material";
import VideoCard from "./VideoCard";

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

  // Debug logs
  useEffect(() => {
    console.log('Current videos:', videos);
    console.log('Current video index:', currentVideoIndex);
  }, [videos, currentVideoIndex]);

  // Ref for load more trigger
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0.1,
  });

  // Load initial videos when component mounts - focus on Firebase videos
  useEffect(() => {
    console.log("Fetching initial videos from Firebase");
    // First try with Firebase videos
    fetchVideos();
    
    // If we have sample videos showing instead of Firebase videos,
    // log this explicitly so we know what's happening
    const checkForFirebaseVideos = setTimeout(() => {
      if (videos.length > 0) {
        const hasFirebaseVideo = videos.some(v => 
          v.videoUrl && v.videoUrl.includes('firebasestorage.googleapis.com')
        );
        console.log("Are we using Firebase videos?", hasFirebaseVideo);
      }
    }, 3000);
    
    return () => clearTimeout(checkForFirebaseVideos);
  }, [fetchVideos]);

  // Load more videos when approaching end
  useEffect(() => {
    if (loadMoreInView && videos.length > 0 && hasMore && !loading) {
      console.log("Fetching more videos");
      fetchMoreVideos();
    }
  }, [loadMoreInView, fetchMoreVideos, videos.length, hasMore, loading]);

  // Threshold for swipe detection (in pixels)
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;
    
    if (isUpSwipe && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (isDownSwipe && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
    
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Wheel event for desktop
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (e.deltaY < 0 && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" && currentVideoIndex < videos.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
      } else if (e.key === "ArrowUp" && currentVideoIndex > 0) {
        setCurrentVideoIndex(currentVideoIndex - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentVideoIndex, videos.length, setCurrentVideoIndex]);

  // Navigation handlers
  const handleNavigateNext = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handleNavigatePrev = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
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
        videos.map((video, index) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            isActive={index === currentVideoIndex}
            index={index}
            onNavigateNext={handleNavigateNext}
            onNavigatePrev={handleNavigatePrev}
          />
        ))
      )}
      
      {/* Load more trigger - placed at the end of the current videos */}
      {hasMore && (
        <div 
          ref={loadMoreRef} 
          className="absolute opacity-0 pointer-events-none"
          style={{ bottom: 20 }}
        />
      )}
      
      {/* Loading indicator - centered with consistent size */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="h-16 w-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
          </div>
        </div>
      )}
    </div>
  );
}
