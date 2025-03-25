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
  const [offset, setOffset] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContainerHeight(window.innerHeight);
    window.addEventListener("resize", () => setContainerHeight(window.innerHeight));
    return () => window.removeEventListener("resize", () => setContainerHeight(window.innerHeight));
  }, []);

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(!isMuted);
  };

  // Simplified handleWheel function
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY > 0 && currentVideoIndex < VIDEOS.length - 1) {
      setCurrentVideoIndex((prev) => prev + 1);
      setOffset(0);
    } else if (e.deltaY < 0 && currentVideoIndex > 0) {
      setCurrentVideoIndex((prev) => prev - 1);
      setOffset(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-hidden bg-black relative"
      onWheel={handleWheel}
    >
      {/* Left Sidebar */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 flex flex-col space-y-6">
        <button className="flex flex-col items-center">
          <div className="rounded-full bg-black/30 p-2">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <span className="text-white text-xs mt-1">For You</span>
        </button>

        <button className="flex flex-col items-center">
          <div className="rounded-full bg-black/30 p-2">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <span className="text-white text-xs mt-1">Following</span>
        </button>
      </div>

      <div className="w-full h-full flex justify-center">
        <div className="relative" style={{ width: "100%", maxWidth: `${containerHeight * 9 / 16}px`, height: "100%" }}>
          <div
            className="absolute w-full transition-transform duration-300 ease-out"
            style={{
              height: containerHeight * VIDEOS.length,
              transform: `translateY(${-currentVideoIndex * containerHeight + offset}px)`,
            }}
          >
            {VIDEOS.map((video, index) => {
              const isVisible = Math.abs(index - currentVideoIndex) <= 1;
              return (
                <div key={video.id} className="absolute w-full" style={{ height: containerHeight, top: index * containerHeight }}>
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
    </div>
  );
}

export default FeedList;
