'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useVideoStore } from "@/store/videoStore";
import { VideoData } from '@/types/video';
import { useInView } from 'react-intersection-observer';

// Simplified video player component focused solely on autoplay reliability
function VideoPlayer({ 
  video, 
  isActive, 
  onPlay 
}: { 
  video: VideoData, 
  isActive: boolean,
  onPlay: (videoId: string) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Always start muted for better autoplay
  const [isPaused, setIsPaused] = useState(false);
  const attemptRef = useRef(0);
  
  // Try to play the video with multiple fallbacks
  const tryPlay = () => {
    console.log(`Attempting to play video ${video.id}, attempt #${attemptRef.current}`);
    const videoEl = videoRef.current;
    if (!videoEl) return;
    
    // Always ensure muted first to improve autoplay chances
    videoEl.muted = isMuted;
    
    // Reset the video if needed
    if (videoEl.currentTime > 0 && videoEl.currentTime > videoEl.duration - 0.5) {
      videoEl.currentTime = 0;
    }
    
    // Try to play with promise handling
    const playPromise = videoEl.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(`Video ${video.id} playing successfully`);
          if (!hasPlayed) {
            setHasPlayed(true);
            onPlay(video.id);
          }
          setIsPaused(false);
          attemptRef.current = 0; // Reset attempts counter on success
        })
        .catch(error => {
          console.error(`Autoplay failed for video ${video.id}:`, error);
          setIsPaused(true);
          
          // Try again with exponential backoff if not too many attempts
          if (attemptRef.current < 5) {
            const delay = Math.pow(2, attemptRef.current) * 300;
            attemptRef.current++;
            setTimeout(tryPlay, delay);
          }
        });
    }
  };
  
  // Handle when a video becomes active
  useEffect(() => {
    if (isActive) {
      setIsPaused(false);
      tryPlay();
    } else {
      // Pause when not active
      const videoEl = videoRef.current;
      if (videoEl && !videoEl.paused) {
        videoEl.pause();
      }
    }
  }, [isActive, video.id]);
  
  // Handle video click to play/pause
  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const videoEl = videoRef.current;
    if (!videoEl) return;
    
    if (videoEl.paused) {
      // If unmuting on click is needed
      if (isMuted && hasPlayed) {
        setIsMuted(false);
        videoEl.muted = false;
      }
      tryPlay();
    } else {
      videoEl.pause();
      setIsPaused(true);
    }
  };
  
  // Handle mute toggle
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };
  
  return (
    <div className="relative h-full w-full" onClick={handleVideoClick}>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
        preload="auto"
        poster={video.thumbnailUrl || undefined}
        onCanPlay={() => {
          console.log(`Video ${video.id} can play now`);
          if (isActive) tryPlay();
        }}
      />
      
      {/* Play/Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="bg-black/50 rounded-full p-6">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Video Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col space-y-4">
        <button
          className="bg-black/50 rounded-full p-3 text-white"
          onClick={toggleMute}
        >
          {isMuted ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>
        
        {/* Other video controls... */}
      </div>
      
      {/* Video Info */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
        <Link 
          href={`/profile/${video.username}`} 
          className="flex items-center mb-2"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-white/30">
            <img
              src={video.userAvatar || "https://placehold.co/100/gray/white?text=User"}
              alt={video.username}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className="font-bold text-white">@{video.username}</p>
            <p className="text-white text-xs opacity-80">{video.song}</p>
          </div>
        </Link>
        <p className="text-white text-sm">{video.caption}</p>
      </div>
    </div>
  );
}

// Main Feed component
export default function VideoFeed() {
  const {
    videos,
    currentVideoIndex,
    setCurrentVideoIndex,
    fetchVideos,
    fetchMoreVideos,
    loading,
    hasMore,
    incrementView
  } = useVideoStore();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(window.innerHeight);
  
  // Load initial videos
  useEffect(() => {
    const initFeed = async () => {
      try {
        await fetchVideos();
        setIsInitialized(true);
        console.log("Videos loaded successfully");
      } catch (error) {
        console.error("Failed to load videos:", error);
      }
    };
    
    initFeed();
    
    // Set up container height
    const updateHeight = () => setContainerHeight(window.innerHeight);
    window.addEventListener('resize', updateHeight);
    
    // Unlock audio context for Safari/iOS
    const unlockAudio = () => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioCtx = new AudioContext();
        audioCtx.resume().then(() => {
          console.log("AudioContext unlocked");
          document.removeEventListener('touchstart', unlockAudio);
          document.removeEventListener('click', unlockAudio);
        });
      }
    };
    
    document.addEventListener('touchstart', unlockAudio, false);
    document.addEventListener('click', unlockAudio, false);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
  }, [fetchVideos]);
  
  // Handle video play event
  const handleVideoPlayed = (videoId: string) => {
    incrementView(videoId);
  };
  
  // Handle scroll/navigation between videos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentVideoIndex < videos.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
      } else if (e.key === 'ArrowUp' && currentVideoIndex > 0) {
        setCurrentVideoIndex(currentVideoIndex - 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, videos.length, setCurrentVideoIndex]);
  
  // Infinite scroll handler
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0.5,
    rootMargin: '0px 0px 500px 0px'
  });
  
  useEffect(() => {
    if (loadMoreInView && !loading && hasMore) {
      fetchMoreVideos();
    }
  }, [loadMoreInView, loading, hasMore, fetchMoreVideos]);
  
  // Loading state
  if (loading && !isInitialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }
  
  // Empty state
  if (!loading && videos.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-white text-lg">No videos available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen w-full overflow-hidden bg-black" ref={containerRef}>
      <div className="w-full h-full flex justify-center">
        <div 
          className="relative overflow-hidden"
          style={{ width: "100%", maxWidth: `${containerHeight * 9/16}px` }}
        >
          <div
            className="w-full transition-transform duration-300"
            style={{ 
              height: containerHeight * videos.length,
              transform: `translateY(-${currentVideoIndex * containerHeight}px)`
            }}
          >
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="absolute w-full"
                style={{ height: containerHeight, top: index * containerHeight }}
              >
                <VideoPlayer
                  video={video}
                  isActive={index === currentVideoIndex}
                  onPlay={handleVideoPlayed}
                />
              </div>
            ))}
          </div>
          
          {/* Load more trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="absolute bottom-0 w-full h-10" />
          )}
        </div>
      </div>
    </div>
  );
}
