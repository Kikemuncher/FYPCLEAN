"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Static video data
const VIDEOS = [
  {
    id: "video1",
    url: "https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4",
    username: "mixkit_user",
    caption: "Christmas decorations with family #holidays",
    song: "Holiday Vibes",
    userAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    likes: 45600,
    comments: 1230
  },
  {
    id: "video2",
    url: "https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4",
    username: "nature_lover",
    caption: "Nature day with marshmallows 🌿 #outdoors #camping",
    song: "Nature Sounds",
    userAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
    likes: 34500,
    comments: 980
  },
  {
    id: "video3",
    url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
    username: "neon_vibes",
    caption: "Neon lights at night ✨ #aesthetic #nightlife",
    song: "Neon Dreams",
    userAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
    likes: 78900,
    comments: 2340
  }
];

function FeedList() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const wheelLock = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent body scrolling while component is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const toggleMute = () => setIsMuted((prev) => !prev);

  // Handle wheel scrolling with a short delay to prevent rapid navigation
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (wheelLock.current) return;
    
    wheelLock.current = true;

    if (e.deltaY > 0 && currentVideoIndex < VIDEOS.length - 1) {
      setCurrentVideoIndex((prev) => prev + 1);
    } else if (e.deltaY < 0 && currentVideoIndex > 0) {
      setCurrentVideoIndex((prev) => prev - 1);
    }

    setTimeout(() => {
      wheelLock.current = false;
    }, 800);
  };

  // Touch event handlers for mobile swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default scrolling behavior
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartY.current) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchEndY - touchStartY.current;

    if (diff < -50 && currentVideoIndex < VIDEOS.length - 1) {
      setCurrentVideoIndex((prev) => prev + 1);
    } else if (diff > 50 && currentVideoIndex > 0) {
      setCurrentVideoIndex((prev) => prev - 1);
    }

    touchStartY.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-hidden bg-black relative"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full h-full flex justify-center">
        <div className="relative w-full max-w-md h-full">
          {VIDEOS.map((video, index) => {
            const isVisible = index === currentVideoIndex;
            return (
              <div key={video.id} className="absolute w-full h-full transition-opacity duration-300"
                style={{ opacity: isVisible ? 1 : 0, zIndex: isVisible ? 1 : 0, pointerEvents: isVisible ? 'auto' : 'none' }}>
                
                {isVisible && (
                  <div className="relative w-full h-full overflow-hidden">
                    <video
                      src={video.url}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      loop
                      playsInline
                      muted={isMuted}
                      preload="auto"
                      autoPlay
                    />
                    
                    {/* Video Information */}
                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                      <div className="flex items-center mb-2">
                        <Link href={`/profile/${video.username}`} className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white hover:border-tiktok-pink transition-colors">
                            <img src={video.userAvatar} alt={video.username} className="w-full h-full object-cover" />
                          </div>
                        </Link>
                        <div className="ml-3 flex-1">
                          <Link href={`/profile/${video.username}`}>
                            <p className="font-bold text-white hover:text-tiktok-pink transition-colors">@{video.username}</p>
                          </Link>
                          <p className="text-gray-300 text-sm">{video.song}</p>
                        </div>
                      </div>
                      <p className="text-white text-sm mb-4">{video.caption}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mute Toggle Button */}
      <button onClick={toggleMute} className="absolute top-4 right-4 bg-black/30 rounded-full p-2 z-30">
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ✅ Correctly placed export statement!
export default FeedList;
