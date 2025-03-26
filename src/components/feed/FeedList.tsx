"use client";

import React, { useState, useEffect, useRef } from "react";
import { useVideoStore } from "@/store/videoStore";
import Link from "next/link";

function FeedList() {
  const { videos, currentVideoIndex, setCurrentVideoIndex, fetchVideos } = useVideoStore();
  const [isMuted, setIsMuted] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const wheelLock = useRef(false);

  // Track window height for full-screen adjustments
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);

    // Fetch videos on component mount
    fetchVideos();

    return () => window.removeEventListener("resize", handleResize);
  }, [fetchVideos]);

  // Handle video navigation on scroll
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (wheelLock.current) return;
    wheelLock.current = true;

    if (e.deltaY > 0 && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (e.deltaY < 0 && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }

    setTimeout(() => {
      wheelLock.current = false;
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black" style={{ height: `${windowHeight}px` }} onWheel={handleWheel}>
      {/* 📌 Side Navigation (Retained) */}
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-8">
        <Link href="/" className="flex flex-col items-center group">
          <div className="rounded-full bg-black/50 p-3 group-hover:bg-black/70 transition-colors">
            <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10-10 4.486-10 10-10-10 4.486-10-10zm-3 17v-10l9 5-9 5z"/>
            </svg>
          </div>
          <span className="text-white text-sm font-medium mt-2">For You</span>
        </Link>

        <Link href="/explore" className="flex flex-col items-center group">
          <div className="rounded-full bg-black/50 p-3 group-hover:bg-black/70 transition-colors">
            <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className="text-gray-300 text-sm font-medium mt-2">Explore</span>
        </Link>
      </div>

      {/* 📹 Video Player Container */}
      <div className="w-full h-full flex justify-center">
        <div 
          className="relative"
          style={{ width: "100%", maxWidth: `${windowHeight * 9 / 16}px`, height: "100%" }}
        >
          {videos.map((video, index) => (
            <div 
              key={video.id} 
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${
                index === currentVideoIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <video
                ref={(el) => { if (el) videoRefs.current[video.id] = el; }}
                src={video.videoUrl}
                className="w-full h-full object-cover"
                loop
                playsInline
                muted={isMuted}
                autoPlay={index === currentVideoIndex}
              />

              {/* 🎭 Video Info Overlay */}
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-white/30">
                    <img 
                      src={video.userAvatar}
                      alt={video.username} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-white">@{video.username}</p>
                    <p className="text-white text-xs opacity-80">{video.song}</p>
                  </div>
                </div>
                <p className="text-white text-sm mb-4">{video.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔇 Mute Button */}
      <button onClick={() => setIsMuted(!isMuted)} className="absolute top-4 right-4 bg-black/30 rounded-full p-2 z-30">
        {isMuted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}

export default FeedList;
