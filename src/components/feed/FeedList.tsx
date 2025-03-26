"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useVideoStore } from "@/stores/videoStore"; // ✅ Importing video store

function FeedList() {
  // ✅ Using video store for state management
  const { videos, currentVideoIndex, setCurrentVideoIndex } = useVideoStore();
  const [isMuted, setIsMuted] = useState(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const wheelLock = useRef(false);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const toggleMute = () => setIsMuted((prev) => !prev);

  // ✅ Handle scrolling to navigate between videos
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
    <div className="fixed inset-0 bg-black overflow-hidden" onWheel={handleWheel}>
      {/* Video Feed */}
      <div className="relative w-full h-full">
        {videos.map((video, index) => {
          const isCurrentVideo = index === currentVideoIndex;

          return (
            <div key={video.id} className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${isCurrentVideo ? "opacity-100" : "opacity-0"}`}>
              <video
                ref={(el) => {
                  if (el) videoRefs.current[video.id] = el;
                }}
                src={video.videoUrl || video.url} // ✅ Ensuring correct video URL
                className="absolute top-0 left-0 w-full h-full object-cover"
                loop
                playsInline
                muted={isMuted}
                preload="auto"
                controls={false}
              />
            </div>
          );
        })}
      </div>

      {/* Mute Button */}
      <button onClick={toggleMute} className="absolute top-4 right-4 bg-black/30 rounded-full p-2 z-30">
        {isMuted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}

export default FeedList;
