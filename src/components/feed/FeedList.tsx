"use client";

import React, { useEffect, useState, useRef } from "react";

// Static data for videos
const VIDEOS = [
  {
    id: "video1",
    url: "https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4",
    username: "holiday_user",
    userAvatar: "/avatars/holiday_user.jpg",
    caption: "Christmas decorations with family #holidays",
    song: "Holiday Vibes",
  },
  {
    id: "video2",
    url: "https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4",
    username: "nature_lover",
    userAvatar: "/avatars/nature_lover.jpg",
    caption: "Nature day with marshmallows 🌿 #outdoors #camping",
    song: "Nature Sounds",
  },
  {
    id: "video3",
    url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
    username: "neon_vibes",
    userAvatar: "/avatars/neon_vibes.jpg",
    caption: "Neon lights at night ✨ #aesthetic #nightlife",
    song: "Neon Dreams",
  }
];

function FeedList() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const wheelLock = useRef(false);
  const trackpadActive = useRef(false);
  const touchActive = useRef(false);
  const trackpadDelta = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContainerHeight(window.innerHeight);
    window.addEventListener("resize", () => setContainerHeight(window.innerHeight));
    return () => window.removeEventListener("resize", () => setContainerHeight(window.innerHeight));
  }, []);

  useEffect(() => {
    const handleTouchStart = () => {
      touchActive.current = true;
    };

    const handleTouchEnd = () => {
      if (touchActive.current && trackpadActive.current) {
        const threshold = containerHeight * 0.2;
        if (offset > threshold && currentVideoIndex > 0) {
          goToPrevVideo();
        } else if (offset < -threshold && currentVideoIndex < VIDEOS.length - 1) {
          goToNextVideo();
        } else {
          setOffset(0);
        }
        trackpadActive.current = false;
      }
      touchActive.current = false;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("pointerdown", handleTouchStart);
    window.addEventListener("pointerup", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("pointerdown", handleTouchStart);
      window.removeEventListener("pointerup", handleTouchEnd);
    };
  }, [containerHeight, currentVideoIndex, offset]);

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const goToNextVideo = () => {
    if (currentVideoIndex < VIDEOS.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
      setOffset(0);
      trackpadDelta.current = 0;
    } else {
      setOffset(0);
      trackpadDelta.current = 0;
    }
  };

  const goToPrevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
      setOffset(0);
      trackpadDelta.current = 0;
    } else {
      setOffset(0);
      trackpadDelta.current = 0;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const isMouseWheel = Math.abs(e.deltaY) > 40 && Math.abs(e.deltaX) === 0;

    if (isMouseWheel && !wheelLock.current) {
      if (e.deltaY > 0 && currentVideoIndex < VIDEOS.length - 1) {
        goToNextVideo();
      } else if (e.deltaY < 0 && currentVideoIndex > 0) {
        goToPrevVideo();
      }
      wheelLock.current = true;
      setTimeout(() => {
        wheelLock.current = false;
      }, 500);
      return;
    }

    trackpadActive.current = true;
    trackpadDelta.current += e.deltaY;
    const sensitivity = 0.7;
    let newOffset = -trackpadDelta.current * sensitivity;
    const maxOffset = containerHeight * 0.8;
    newOffset = Math.max(Math.min(newOffset, maxOffset), -maxOffset);

    if ((newOffset > 0 && currentVideoIndex === 0) || 
        (newOffset < 0 && currentVideoIndex === VIDEOS.length - 1)) {
      newOffset = newOffset * 0.3;
    }
    setOffset(newOffset);
  };

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full overflow-hidden bg-black relative"
      onWheel={handleWheel}
    >
      <div className="w-full h-full flex justify-center">
        <div className="relative" style={{ width: "100%", maxWidth: `${containerHeight * 9 / 16}px`, height: "100%" }}>
          <div 
            className="absolute w-full transition-transform duration-300 ease-out"
            style={{ height: containerHeight * VIDEOS.length, transform: `translateY(${-currentVideoIndex * containerHeight + offset}px)` }}
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
                          <a href={`/profile/${video.username}`}>
                            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-white/30">
                              <img src={video.userAvatar} alt={video.username} className="w-full h-full object-cover" />
                            </div>
                          </a>
                          <div>
                            <a href={`/profile/${video.username}`}>
                              <p className="font-bold text-white flex items-center">
                                @{video.username}
                              </p>
                            </a>
                            <p className="text-gray-400 text-sm">{video.song}</p>
                          </div>
                          <button className="ml-auto text-tiktok-pink text-sm font-medium">Follow</button>
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
