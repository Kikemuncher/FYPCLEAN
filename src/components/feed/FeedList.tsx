"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

// Static data for videos
const VIDEOS = [
  {
    id: "video1",
    url: "https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4",
    username: "holiday_user",
    userAvatar: "/avatars/holiday_user.jpg",
    caption: "Christmas decorations with family #holidays",
    song: "Holiday Vibes",
    likes: 1250,
    comments: 340,
  },
  {
    id: "video2",
    url: "https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4",
    username: "nature_lover",
    userAvatar: "/avatars/nature_lover.jpg",
    caption: "Nature day with marshmallows 🌿 #outdoors #camping",
    song: "Nature Sounds",
    likes: 860,
    comments: 120,
  },
  {
    id: "video3",
    url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
    username: "neon_vibes",
    userAvatar: "/avatars/neon_vibes.jpg",
    caption: "Neon lights at night ✨ #aesthetic #nightlife",
    song: "Neon Dreams",
    likes: 2320,
    comments: 510,
  },
];

function FeedList() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const wheelLock = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent body scrolling when component mounts
    document.body.style.overflow = "hidden";

    // Restore body scrolling when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(!isMuted);
  };

  // Simplified wheel handler with a delay to prevent rapid scrolling
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
    }, 500);
  };

  // Touch event handlers for mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent browser scrolling
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
              <div key={video.id} className="absolute w-full h-full" style={{ top: index * 100 + "%" }}>
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
    </div>
  );
}

export default FeedList;
