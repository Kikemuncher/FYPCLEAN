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

  return (
    <div className="fixed inset-0 bg-black" style={{ height: `${windowHeight}px` }} onWheel={handleWheel}>
      
      {/* Side Navigation */}
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-8">
        <button className="flex flex-col items-center group">
          <div className="rounded-full bg-black/50 p-3 group-hover:bg-black/70 transition-colors">
            <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3 17v-10l9 5-9 5z"/>
            </svg>
          </div>
          <span className="text-white text-sm font-medium mt-2">For You</span>
        </button>

        <button className="flex flex-col items-center group">
          <div className="rounded-full bg-black/50 p-3 group-hover:bg-black/70 transition-colors">
            <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-gray-300 text-sm font-medium mt-2">Following</span>
        </button>

        {/* New Side Navigation Buttons */}
        <Link href="/explore" className="flex flex-col items-center group">
          <div className="rounded-full bg-black/50 p-3 group-hover:bg-black/70 transition-colors">
            <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className="text-gray-300 text-sm font-medium mt-2">Explore</span>
        </Link>

        <Link href="/inbox" className="flex flex-col items-center group">
          <div className="rounded-full bg-black/50 p-3 group-hover:bg-black/70 transition-colors">
            <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <span className="text-gray-300 text-sm font-medium mt-2">Inbox</span>
        </Link>
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
