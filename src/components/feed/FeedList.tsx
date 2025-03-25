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
  const [likedVideos, setLikedVideos] = useState<{ [key: string]: boolean }>({});

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

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const goToNextVideo = () => {
    if (currentVideoIndex < VIDEOS.length - 1) {
      setCurrentVideoIndex((prev) => prev + 1);
      setOffset(0);
      trackpadDelta.current = 0;
    } else {
      setOffset(0);
      trackpadDelta.current = 0;
    }
  };

  const goToPrevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex((prev) => prev - 1);
      setOffset(0);
      trackpadDelta.current = 0;
    } else {
      setOffset(0);
      trackpadDelta.current = 0;
    }
  };

  const handleLike = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedVideos((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
  };

  const formatCount = (num: number) => (num >= 1000 ? (num / 1000).toFixed(1) + "K" : num);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-hidden bg-black relative"
      onWheel={(e) => e.preventDefault()}
    >
      <div className="w-full h-full flex justify-center">
        <div
          className="relative"
          style={{ width: "100%", maxWidth: `${containerHeight * 9 / 16}px`, height: "100%" }}
        >
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

                      {/* Updated Username Display Section */}
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                        <div className="flex items-center mb-2">
                          <Link href={`/profile/${video.username}`} className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white hover:border-tiktok-pink transition-colors">
                              <img
                                src={video.userAvatar}
                                alt={video.username}
                                className="w-full h-full object-cover"
                              />
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

                          <button
                            className="ml-2 px-3 py-1 bg-tiktok-pink rounded-full text-white text-sm font-medium hover:bg-pink-700 transition-colors"
                          >
                            Follow
                          </button>
                        </div>

                        <p className="text-white text-sm mb-4">{video.caption}</p>
                      </div>

                      {/* Video Interaction Buttons */}
                      <div className="absolute right-3 bottom-24 flex flex-col items-center space-y-5 z-10">
                        <button className="flex flex-col items-center" onClick={(e) => handleLike(video.id, e)}>
                          <div className="rounded-full bg-black/20 p-2">
                            <svg
                              className={`h-8 w-8 ${likedVideos[video.id] ? "text-red-500" : "text-white"}`}
                              fill={likedVideos[video.id] ? "currentColor" : "none"}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                          </div>
                          <span className="text-white text-xs mt-1">{formatCount(video.likes)}</span>
                        </button>

                        <button className="flex flex-col items-center">
                          <div className="rounded-full bg-black/20 p-2">
                            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
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
    </div>
  );
}

export default FeedList;
