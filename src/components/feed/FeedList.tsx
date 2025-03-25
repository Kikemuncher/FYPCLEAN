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
    comments: 1230,
  },
  {
    id: "video2",
    url: "https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4",
    username: "nature_lover",
    caption: "Nature day with marshmallows 🌿 #outdoors #camping",
    song: "Nature Sounds",
    userAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
    likes: 34500,
    comments: 980,
  },
  {
    id: "video3",
    url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
    username: "neon_vibes",
    caption: "Neon lights at night ✨ #aesthetic #nightlife",
    song: "Neon Dreams",
    userAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
    likes: 78900,
    comments: 2340,
  },
];

function FeedList() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const wheelLock = useRef(false);
  const touchStartY = useRef<number | null>(null);

  // Track window height for full-screen adjustments
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const toggleMute = () => setIsMuted((prev) => !prev);

  // Handle scroll navigation
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

  // Handle touch gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default scrolling
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
      className="fixed inset-0 bg-black"
      style={{ height: `${windowHeight}px` }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Side Navigation */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-6">
        <button className="flex flex-col items-center">
          <div className="rounded-full bg-black/30 p-2">
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3 17v-10l9 5-9 5z"/>
            </svg>
          </div>
          <span className="text-white text-xs mt-1">For You</span>
        </button>
      </div>

      {/* Video Container */}
      <div className="w-full h-full flex justify-center">
        <div className="relative w-full max-w-md h-full">
          {VIDEOS.map((video, index) => (
            <div
              key={video.id}
              className="absolute w-full h-full transition-opacity duration-300"
              style={{
                opacity: index === currentVideoIndex ? 1 : 0,
                zIndex: index === currentVideoIndex ? 1 : 0,
                pointerEvents: index === currentVideoIndex ? "auto" : "none",
              }}
            >
              {index === currentVideoIndex && (
                <div className="relative w-full h-full overflow-hidden">
                  <video
                    src={video.url}
                    className="absolute top-0 left-0 w-full h-full object-contain"
                    loop
                    playsInline
                    muted={isMuted}
                    autoPlay
                  />

                  {/* Video Info */}
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                    <div className="flex items-center mb-2">
                      <Link href={`/profile/${video.username}`} className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white hover:border-tiktok-pink transition-colors">
                          <img src={video.userAvatar} alt={video.username} className="w-full h-full object-cover" />
                        </div>
                      </Link>
                      <div className="ml-3 flex-1">
                        <Link href={`/profile/${video.username}`}>
                          <p className="font-bold text-white hover:text-tiktok-pink transition-colors">
                            @{video.username}
                          </p>
                        </Link>
                        <p className="text-gray-300 text-sm">{video.song}</p>
                      </div>
                    </div>
                    <p className="text-white text-sm mb-4">{video.caption}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mute Button */}
      <button onClick={toggleMute} className="absolute top-4 right-4 bg-black/30 rounded-full p-2 z-30">
        {isMuted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}

// ✅ Exporting correctly
export default FeedList;
