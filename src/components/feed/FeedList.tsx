"use client";

import React, { useEffect, useState, useRef } from "react";

// Static data for videos
const VIDEOS = [
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

// Format function for numbers
const formatCount = (count) => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
};

function FeedList() {
  // State
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  
  // Refs
  const videoRefs = useRef({});
  const lastTap = useRef(0);
  const isDragging = useRef(false);
  const startY = useRef(null);
  const lastY = useRef(0);
  const velocity = useRef(0);
  const lastVelocity = useRef([]);
  const animationRef = useRef(null);
  const isMouseWheel = useRef(false);
  
  // Set up container dimensions
  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Update dimensions
  const updateDimensions = () => {
    const height = window.innerHeight;
    const width = Math.min(window.innerWidth, height * 9 / 16);
    
    setContainerHeight(height);
    setContainerWidth(width);
    setTranslateY(-currentVideoIndex * height);
  };
  
  // Video playback management
  useEffect(() => {
    if (containerHeight === 0) return;
    
    // Determine which video is most visible
    const normalizedTranslate = -translateY;
    const visibleIndex = Math.round(normalizedTranslate / containerHeight);
    
    if (visibleIndex >= 0 && visibleIndex < VIDEOS.length && visibleIndex !== currentVideoIndex) {
      setCurrentVideoIndex(visibleIndex);
    }
    
    // Pause all videos
    Object.values(videoRefs.current).forEach(videoRef => {
      if (videoRef && !videoRef.paused) {
        videoRef.pause();
      }
    });
    
    // Play current video
    const currentVideo = videoRefs.current[VIDEOS[visibleIndex]?.id];
    if (currentVideo) {
      const playPromise = currentVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.log("Autoplay prevented, waiting for user interaction");
        });
      }
    }
  }, [translateY, containerHeight, currentVideoIndex]);
  
  // Snap to nearest video
  const snapToNearestVideo = () => {
    if (isDragging.current) return;
    
    const normalizedTranslate = -translateY;
    const nearestIndex = Math.round(normalizedTranslate / containerHeight);
    const targetIndex = Math.max(0, Math.min(VIDEOS.length - 1, nearestIndex));
    const targetTranslate = -targetIndex * containerHeight;
    
    // Animation
    const startTranslate = translateY;
    const distance = targetTranslate - startTranslate;
    const startTime = performance.now();
    const duration = 300;
    
    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easing = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      
      setTranslateY(startTranslate + distance * easing);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // Apply momentum scrolling
  const applyMomentum = () => {
    if (isDragging.current) return;
    
    // Get average velocity
    if (lastVelocity.current.length > 0) {
      velocity.current = lastVelocity.current.reduce((a, b) => a + b, 0) / lastVelocity.current.length;
    }
    
    // If velocity is very low, just snap to nearest
    if (Math.abs(velocity.current) < 0.5) {
      velocity.current = 0;
      lastVelocity.current = [];
      snapToNearestVideo();
      return;
    }
    
    // Apply deceleration
    velocity.current *= 0.95;
    
    // Update position
    const newTranslate = translateY + velocity.current;
    
    // Apply boundaries with rubber band effect
    const maxTranslate = 0;
    const minTranslate = -(VIDEOS.length - 1) * containerHeight;
    
    let finalTranslate = newTranslate;
    
    if (newTranslate > maxTranslate) {
      // Rubber band at top
      finalTranslate = maxTranslate + (newTranslate - maxTranslate) * 0.2;
      velocity.current *= 0.8;
    } else if (newTranslate < minTranslate) {
      // Rubber band at bottom
      finalTranslate = minTranslate + (newTranslate - minTranslate) * 0.2;
      velocity.current *= 0.8;
    }
    
    setTranslateY(finalTranslate);
    
    // Continue momentum scrolling
    animationRef.current = requestAnimationFrame(applyMomentum);
  };
  
  // Handle wheel events
  const handleWheel = (e) => {
    e.preventDefault();
    
    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Detect if this is mouse wheel or trackpad
    isMouseWheel.current = Math.abs(e.deltaY) > 50;
    
    if (isMouseWheel.current) {
      // For mouse wheel, discrete navigation
      const direction = e.deltaY > 0 ? 1 : -1;
      const targetIndex = Math.max(0, Math.min(VIDEOS.length - 1, currentVideoIndex + direction));
      const targetTranslate = -targetIndex * containerHeight;
      
      // Simple animation
      const startPosition = translateY;
      const distance = targetTranslate - startPosition;
      const startTime = performance.now();
      const duration = 300;
      
      const animateWheel = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easing = 1 - Math.pow(1 - progress, 3);
        
        setTranslateY(startPosition + distance * easing);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateWheel);
        } else {
          animationRef.current = null;
          setCurrentVideoIndex(targetIndex);
        }
      };
      
      animationRef.current = requestAnimationFrame(animateWheel);
    } else {
      // For trackpad, direct manipulation
      const now = performance.now();
      
      // Calculate velocity for momentum
      const instantVelocity = -e.deltaY * 0.5;
      lastVelocity.current.push(instantVelocity);
      
      // Keep only recent velocities
      if (lastVelocity.current.length > 5) {
        lastVelocity.current.shift();
      }
      
      // Update position directly
      const newTranslate = translateY - e.deltaY;
      
      // Apply boundaries with rubber band effect
      const maxTranslate = 0;
      const minTranslate = -(VIDEOS.length - 1) * containerHeight;
      
      let finalTranslate = newTranslate;
      
      if (newTranslate > maxTranslate) {
        finalTranslate = maxTranslate + (newTranslate - maxTranslate) * 0.2;
      } else if (newTranslate < minTranslate) {
        finalTranslate = minTranslate + (newTranslate - minTranslate) * 0.2;
      }
      
      setTranslateY(finalTranslate);
      
      // Set up momentum scrolling when no more wheel events come in
      clearTimeout(window.wheelTimeout);
      window.wheelTimeout = setTimeout(() => {
        animationRef.current = requestAnimationFrame(applyMomentum);
      }, 100);
    }
  };
  
  // Touch/pointer events
  const handlePointerDown = (e) => {
    if (e.pointerType !== 'touch' && e.button !== 0) return;
    
    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    isDragging.current = true;
    startY.current = e.clientY;
    lastY.current = e.clientY;
    velocity.current = 0;
    lastVelocity.current = [];
  };
  
  const handlePointerMove = (e) => {
    if (!isDragging.current || startY.current === null) return;
    
    const currentY = e.clientY;
    const deltaY = lastY.current - currentY;
    
    // Calculate velocity
    const instantVelocity = deltaY * 0.5;
    lastVelocity.current.push(instantVelocity);
    
    // Keep only recent velocities
    if (lastVelocity.current.length > 5) {
      lastVelocity.current.shift();
    }
    
    // Update position
    const newTranslate = translateY + deltaY;
    
    // Apply boundaries with rubber band effect
    const maxTranslate = 0;
    const minTranslate = -(VIDEOS.length - 1) * containerHeight;
    
    let finalTranslate = newTranslate;
    
    if (newTranslate > maxTranslate) {
      finalTranslate = maxTranslate + (newTranslate - maxTranslate) * 0.2;
    } else if (newTranslate < minTranslate) {
      finalTranslate = minTranslate + (newTranslate - minTranslate) * 0.2;
    }
    
    setTranslateY(finalTranslate);
    
    lastY.current = currentY;
  };
  
  const handlePointerUp = () => {
    if (!isDragging.current) return;
    
    isDragging.current = false;
    startY.current = null;
    
    // Apply momentum
    animationRef.current = requestAnimationFrame(applyMomentum);
  };
  
  // Toggle mute
  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  // Handle likes
  const toggleLike = (videoId, e) => {
    e.stopPropagation();
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };
  
  // Double tap
  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSince = now - lastTap.current;
    
    if (timeSince < 300 && timeSince > 0) {
      const currentVideo = VIDEOS[currentVideoIndex];
      if (currentVideo) {
        setLikedVideos(prev => ({
          ...prev,
          [currentVideo.id]: true
        }));
      }
    }
    
    lastTap.current = now;
  };
  
  return (
    <div 
      className="h-screen w-full overflow-hidden bg-black relative"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleDoubleTap}
      style={{ touchAction: 'none' }}
    >
      {/* Main video container */}
      <div className="w-full h-full flex justify-center items-center">
        <div 
          className="relative"
          style={{ 
            width: containerWidth || '100%',
            maxWidth: `${(containerHeight || window.innerHeight) * 9 / 16}px`,
            height: containerHeight || '100%'
          }}
        >
          {/* Videos container */}
          <div 
            className="absolute w-full"
            style={{ 
              height: (containerHeight || window.innerHeight) * VIDEOS.length,
              transform: `translateY(${translateY}px)`,
              willChange: 'transform'
            }}
          >
            {VIDEOS.map((video, index) => {
              // Only render nearby videos
              const distanceFromVisible = Math.abs((translateY / (containerHeight || window.innerHeight)) + index);
              const isVisible = distanceFromVisible < 2;
              
              return (
                <div 
                  key={video.id} 
                  className="absolute w-full"
                  style={{ 
                    height: containerHeight || window.innerHeight,
                    top: index * (containerHeight || window.innerHeight),
                  }}
                >
                  {isVisible && (
                    <div className="relative w-full h-full overflow-hidden">
                      {/* Video element */}
                      <video
                        ref={(el) => { if (el) videoRefs.current[video.id] = el; }}
                        src={video.url}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        loop
                        playsInline
                        muted={isMuted}
                        preload="auto"
                        controls={false}
                      />
                      
                      {/* Video info overlay */}
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-white/30">
                            <img 
                              src={`https://randomuser.me/api/portraits/men/${index + 1}.jpg`}
                              alt={video.username} 
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/100/gray/white?text=User';
                              }}
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
                          onClick={(e) => toggleLike(video.id, e)}
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
          </div>
        </div>
      </div>
      
      {/* Sound toggle button */}
      <button 
        onClick={(e) => toggleMute(e)}
        className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 rounded-full p-2 z-30 transition-colors"
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
        <span className="text-white text-sm">{currentVideoIndex + 1} / {VIDEOS.length}</span>
      </div>
      
      {/* Progress dots */}
      <div className="absolute top-14 left-0 right-0 flex justify-center z-30">
        <div className="flex space-x-1">
          {VIDEOS.map((_, index) => {
            const normalizedPosition = -translateY / containerHeight;
            const distanceFromIndex = Math.abs(normalizedPosition - index);
            const isActive = distanceFromIndex < 1;
            
            return (
              <div 
                key={index}
                className={`rounded-full h-1.5 ${
                  isActive 
                    ? index === currentVideoIndex 
                      ? 'w-4 bg-white' 
                      : 'w-3 bg-white/80'
                    : 'w-1.5 bg-white/50'
                } transition-all duration-200`}
              />
            );
          })}
        </div>
      </div>
      
      {/* Scroll guide indicator */}
      {VIDEOS.length > 1 && currentVideoIndex === 0 && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/30 px-3 py-1 rounded-full z-30 flex items-center">
          <span className="mr-2">Swipe up for more</span>
          <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default FeedList;
