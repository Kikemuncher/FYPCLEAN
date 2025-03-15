"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Define video interface
interface Video {
  id: string;
  url: string;
  username: string;
  caption: string;
  song: string;
  likes: number;
  comments: number;
}

// Static data to ensure we always have videos
const VIDEOS: Video[] = [
  {
    id: "video1",
    url: "https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4",
    username: "holiday_user",
    caption: "Christmas decorations with family #holidays",
    song: "Holiday Vibes",
    likes: 45600,
    comments: 1230,
  },
  {
    id: "video2",
    url: "https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4",
    username: "nature_lover",
    caption: "Nature day with marshmallows 🌿 #outdoors #camping",
    song: "Nature Sounds",
    likes: 34500,
    comments: 980,
  },
  {
    id: "video3",
    url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
    username: "neon_vibes",
    caption: "Neon lights at night ✨ #aesthetic #nightlife",
    song: "Neon Dreams",
    likes: 78900,
    comments: 2340,
  },
  {
    id: "video4",
    url: "https://assets.mixkit.co/videos/preview/mixkit-taking-photos-from-different-angles-of-a-model-34421-large.mp4",
    username: "fashion_photo",
    caption: "Fashion shoot BTS 📸 #fashion #photoshoot",
    song: "Studio Vibes",
    likes: 23400,
    comments: 870,
  },
  {
    id: "video5",
    url: "https://assets.mixkit.co/videos/preview/mixkit-womans-feet-splashing-in-the-pool-1261-large.mp4",
    username: "pool_vibes",
    caption: "Pool day 💦 #summer #poolside #relax",
    song: "Summer Splash",
    likes: 67800,
    comments: 1540,
  }
];

// Simple format function for large numbers
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
};

export default function FeedList(): JSX.Element {
  // Client-side rendering detection
  const [isClient, setIsClient] = useState<boolean>(false);
  
  // Current active video
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Track likes
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  
  // Video playing state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Window height for proper sizing
  const [windowHeight, setWindowHeight] = useState<number>(0);
  
  // For swipe functionality
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwipeLocked, setIsSwipeLocked] = useState<boolean>(false);
  
  // Video element references
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  
  // Set up client-side detection
  useEffect(() => {
    setIsClient(true);
    
    // Set window height
    const updateHeight = (): void => {
      setWindowHeight(window.innerHeight);
    };
    
    // Initialize height
    updateHeight();
    
    // Listen for resize
    window.addEventListener('resize', updateHeight);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  
  // Handle video playback when current index changes
  useEffect(() => {
    if (!isClient) return;
    
    // Safety check
    if (currentIndex < 0 || currentIndex >= VIDEOS.length) {
      setCurrentIndex(0);
      return;
    }
    
    // Pause all videos first
    Object.values(videoRefs.current).forEach((videoRef) => {
      if (videoRef && !videoRef.paused) {
        try {
          videoRef.pause();
        } catch (error) {
          console.error("Error pausing video:", error);
        }
      }
    });
    
    // Play current video with retry
    const playCurrentVideo = async (): Promise<void> => {
      const currentVideo = videoRefs.current[VIDEOS[currentIndex].id];
      if (!currentVideo) return;
      
      try {
        // Reset playback position
        currentVideo.currentTime = 0;
        
        // Use click to play as a workaround for autoplay policy
        const playAttempt = await currentVideo.play();
        
        console.log("Video started playing");
      } catch (error) {
        console.error("Autoplay failed, trying with user interaction:", error);
        
        // If autoplay is blocked by browser policy
        const playOnInteraction = (): void => {
          const videoElem = videoRefs.current[VIDEOS[currentIndex].id];
          if (videoElem) {
            videoElem.play()
              .then(() => {
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('touchstart', playOnInteraction);
                console.log("Video started after user interaction");
              })
              .catch(err => console.error("Still couldn't play video:", err));
          }
        };
        
        document.addEventListener('click', playOnInteraction, { once: true });
        document.addEventListener('touchstart', playOnInteraction, { once: true });
      }
    };
    
    playCurrentVideo();
    
  }, [currentIndex, isClient]);
  
  // Show play button overlay on first load to encourage user interaction
  useEffect(() => {
    if (isClient) {
      // Force a touch event to trigger play for Safari
      const triggerPlayEvent = (): void => {
        const currentVideo = videoRefs.current[VIDEOS[currentIndex]?.id];
        if (currentVideo && currentVideo.paused) {
          currentVideo.play().catch(err => console.log("Still couldn't play:", err));
        }
      };
      
      window.addEventListener('touchstart', triggerPlayEvent, { once: true });
      window.addEventListener('click', triggerPlayEvent, { once: true });
      
      return () => {
        window.removeEventListener('touchstart', triggerPlayEvent);
        window.removeEventListener('click', triggerPlayEvent);
      };
    }
  }, [isClient, currentIndex]);
  
  // Set video ref
  const setVideoRef = (id: string, el: HTMLVideoElement | null): void => {
    videoRefs.current[id] = el;
  };
  
  // Toggle mute
  const toggleMute = (): void => {
    setIsMuted(!isMuted);
  };
  
  // Navigate through videos
  const goToNext = (): void => {
    if (currentIndex < VIDEOS.length - 1 && !isSwipeLocked) {
      setIsSwipeLocked(true);
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => setIsSwipeLocked(false), 500);
    }
  };
  
  const goToPrevious = (): void => {
    if (currentIndex > 0 && !isSwipeLocked) {
      setIsSwipeLocked(true);
      setCurrentIndex(currentIndex - 1);
      setTimeout(() => setIsSwipeLocked(false), 500);
    }
  };
  
  // Toggle like
  const toggleLike = (videoId: string): void => {
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };
  
  // Handle wheel events
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>): void => {
    e.preventDefault();
    
    if (isSwipeLocked) return;
    
    if (e.deltaY > 50 && currentIndex < VIDEOS.length - 1) {
      goToNext();
    } else if (e.deltaY < -50 && currentIndex > 0) {
      goToPrevious();
    }
  };
  
  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent): void => {
    if (isSwipeLocked) return;
    setTouchStart(e.targetTouches[0].clientY);
  };
  
  const handleTouchMove = (e: React.TouchEvent): void => {
    if (isSwipeLocked) return;
    setTouchEnd(e.targetTouches[0].clientY);
  };
  
  const handleTouchEnd = (): void => {
    if (isSwipeLocked || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (distance > minSwipeDistance && currentIndex < VIDEOS.length - 1) {
      // Swipe up
      goToNext();
    } else if (distance < -minSwipeDistance && currentIndex > 0) {
      // Swipe down
      goToPrevious();
    }
    
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };
  
  // Handle key presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        goToNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        goToPrevious();
      } else if (e.key === 'm') {
        toggleMute();
      }
    };
    
    if (isClient) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isClient, currentIndex]);
  
  // Loading state
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return (
    <div 
      className="h-screen w-full overflow-hidden bg-black relative"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video Feed Container */}
      <motion.div 
        className="absolute w-full"
        style={{ 
          height: windowHeight * VIDEOS.length,
          y: -currentIndex * windowHeight
        }}
        animate={{ 
          y: -currentIndex * windowHeight 
        }}
        transition={{ 
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1]
        }}
      >
        {VIDEOS.map((video, index) => {
          const isVisible = Math.abs(index - currentIndex) <= 1;
          const isActive = index === currentIndex;
          
          return (
            <div 
              key={video.id} 
              className="absolute w-full"
              style={{ 
                height: windowHeight, 
                top: index * windowHeight
              }}
            >
              {isVisible && (
                <div className="relative w-full h-full">
                  {/* Video Element */}
                  <video
                    ref={(el) => setVideoRef(video.id, el)}
                    src={video.url}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    muted={isMuted}
                    preload="auto"
                    controls={false}
                    poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" // Transparent poster
                  />
                  
                  {/* Play button overlay - shows initially or when video is paused */}
                  {isActive && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10"
                      onClick={() => {
                        const video = videoRefs.current[video.id];
                        if (video) {
                          if (video.paused) {
                            video.play().catch(e => console.error("Play failed:", e));
                          } else {
                            video.pause();
                          }
                        }
                      }}
                    >
                      <div className="rounded-full bg-black/50 p-5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  
                  {/* Video Info Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-white/30 bg-gray-700">
                        <img 
                          src={`https://randomuser.me/api/portraits/men/${index + 1}.jpg`}
                          alt={video.username} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            // TypeScript fix for error event
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = 'https://placehold.co/100/gray/white?text=User';
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          @{video.username}
                        </p>
                        <p className="text-white text-xs opacity-80">{video.song}</p>
                      </div>
                    </div>
                    <p className="text-white text-sm mb-4">{video.caption}</p>
                  </div>
                  
                  {/* Side Actions */}
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
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>
      
      {/* Sound Toggle Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 rounded-full p-2 z-30"
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

      {/* Navigation Controls */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 space-y-4 z-30">
        <button 
          onClick={goToPrevious} 
          className={`bg-black/30 p-2 rounded-full ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/50'}`}
          disabled={currentIndex === 0 || isSwipeLocked}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button 
          onClick={goToNext} 
          className={`bg-black/30 p-2 rounded-full ${currentIndex === VIDEOS.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/50'}`}
          disabled={currentIndex === VIDEOS.length - 1 || isSwipeLocked}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Counter Indicator */}
      <div className="absolute top-4 left-4 bg-black/30 rounded-full px-3 py-1 z-30">
        <span className="text-white text-sm">{currentIndex + 1} / {VIDEOS.length}</span>
      </div>
      
      {/* Swipe indicator (helpful for first-time users) */}
      {currentIndex === 0 && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-30">
          <div className="bg-black/30 rounded-full px-3 py-1 mb-2">
            <span className="text-white text-sm">Swipe up for next video</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" />
          </svg>
        </div>
      )}
    </div>
  );
}
