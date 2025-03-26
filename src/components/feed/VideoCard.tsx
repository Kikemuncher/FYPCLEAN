"use client";

import { useEffect, useRef, useState } from "react";
import { useVideoStore } from "@/store/videoStore";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";

export default function FeedList() {
  const {
    videos,
    currentVideoIndex,
    setCurrentVideoIndex,
    fetchVideos,
    fetchMoreVideos,
    loading,
    hasMore,
    likeVideo,
  } = useVideoStore();

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const videoTimeRefs = useRef<Record<string, number>>({});
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const lastTap = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);
  const wheelEvents = useRef<WheelEvent[]>([]);
  const isWheeling = useRef<boolean>(false);
  const wheelDetectionTimer = useRef<any>(null);
  const wheelReleaseTimer = useRef<any>(null);
  const inertiaFrameId = useRef<any>(null);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    setContainerHeight(window.innerHeight);
    const updateHeight = () => setContainerHeight(window.innerHeight);
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
      if (wheelDetectionTimer.current) clearTimeout(wheelDetectionTimer.current);
      if (wheelReleaseTimer.current) clearTimeout(wheelReleaseTimer.current);
      if (inertiaFrameId.current) cancelAnimationFrame(inertiaFrameId.current);
    };
  }, []);

  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (loadMoreInView && videos.length > 0 && hasMore && !loading) {
      fetchMoreVideos();
    }
  }, [loadMoreInView, fetchMoreVideos, videos.length, hasMore, loading]);

  const toggleMute = () => setIsMuted(!isMuted);

  const togglePlayPause = () => {
    const videoId = videos[currentVideoIndex]?.id;
    if (!videoId) return;
    const currentVideo = videoRefs.current[videoId];
    if (currentVideo) {
      if (currentVideo.paused) {
        if (videoTimeRefs.current[videoId] !== undefined) {
          currentVideo.currentTime = videoTimeRefs.current[videoId];
        }
        currentVideo.play();
        setIsPaused(false);
      } else {
        videoTimeRefs.current[videoId] = currentVideo.currentTime;
        currentVideo.pause();
        setIsPaused(true);
      }
    }
  };

  const toggleLike = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedVideos((prev) => {
      const newState = { ...prev, [videoId]: !prev[videoId] };
      if (newState[videoId]) likeVideo(videoId);
      return newState;
    });
  };

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, videoRef]) => {
      if (videoRef && !videoRef.paused) {
        videoTimeRefs.current[id] = videoRef.currentTime;
        videoRef.pause();
      }
    });
    const videoId = videos[currentVideoIndex]?.id;
    const currentVideo = videoRefs.current[videoId];
    if (currentVideo) {
      currentVideo.currentTime = 0;
      if (!isPaused) {
        currentVideo.play().catch(() => setIsPaused(true));
      }
    }
  }, [currentVideoIndex, videos, isPaused]);

  const canScrollInDirection = (dir: "up" | "down"): boolean =>
    dir === "up" ? currentVideoIndex > 0 : currentVideoIndex < videos.length - 1;

  const goToNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setOffset(0);
    } else {
      setOffset(0);
    }
  };

  const goToPrevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setOffset(0);
    } else {
      setOffset(0);
    }
  };

  const animateSnapBack = () => {
    const startOffset = offset;
    const startTime = performance.now();
    const duration = 300;
    const animateFrame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const newOffset = startOffset * (1 - easedProgress);
      setOffset(newOffset);
      if (progress < 1) {
        inertiaFrameId.current = requestAnimationFrame(animateFrame);
      } else {
        setOffset(0);
        inertiaFrameId.current = null;
      }
    };
    inertiaFrameId.current = requestAnimationFrame(animateFrame);
  };

  const handleWheelRelease = () => {
    if (wheelEvents.current.length === 0) return;
    if (Math.abs(offset) > containerHeight * 0.25) {
      if (offset > 0 && canScrollInDirection("up")) {
        goToPrevVideo();
      } else if (offset < 0 && canScrollInDirection("down")) {
        goToNextVideo();
      } else {
        animateSnapBack();
      }
    } else {
      animateSnapBack();
    }
    wheelEvents.current = [];
    isWheeling.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (inertiaFrameId.current) cancelAnimationFrame(inertiaFrameId.current);
    if (wheelDetectionTimer.current) clearTimeout(wheelDetectionTimer.current);
    if (wheelReleaseTimer.current) clearTimeout(wheelReleaseTimer.current);

    wheelEvents.current.push(e.nativeEvent);
    isWheeling.current = true;

    const direction = e.deltaY > 0 ? "down" : "up";
    let newOffset = offset + (direction === "down" ? -20 : 20);
    const maxOffset = containerHeight * 0.8;
    newOffset = Math.max(Math.min(newOffset, maxOffset), -maxOffset);
    setOffset(newOffset);

    wheelReleaseTimer.current = setTimeout(() => {
      if (isWheeling.current) handleWheelRelease();
    }, 200);
  };

  const handleVideoClick = () => {
    if (Date.now() - lastTap.current < 300) return;
    togglePlayPause();
  };

  const formatCount = (count: number): string => {
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + "M";
    if (count >= 1_000) return (count / 1_000).toFixed(1) + "K";
    return count.toString();
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-black relative" onWheel={handleWheel}>
      <div className="w-full h-full flex justify-center">
        <div
          className="relative"
          style={{ width: "100%", maxWidth: `${containerHeight * 9 / 16}px`, height: "100%" }}
        >
          <div
            className="absolute w-full transition-transform duration-300 ease-out"
            style={{
              height: containerHeight * videos.length,
              transform: `translateY(${-currentVideoIndex * containerHeight + offset}px)`,
            }}
          >
            {videos.map((video, index) => {
              const isVisible = Math.abs(index - currentVideoIndex) <= 1;
              const isCurrentVideo = index === currentVideoIndex;
              return (
                <div
                  key={video.id}
                  className="absolute w-full"
                  style={{ height: containerHeight, top: index * containerHeight }}
                >
                  {isVisible && (
                    <div
                      className="relative w-full h-full overflow-hidden"
                      onClick={isCurrentVideo ? handleVideoClick : undefined}
                    >
                      <video
                        ref={(el) => {
                          if (el) videoRefs.current[video.id] = el;
                        }}
                        src={video.videoUrl}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        loop
                        playsInline
                        muted={isMuted}
                        preload="auto"
                      />

                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                        <Link href={`/profile/${video.username}`} className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-white/30">
                            <img
                              src={video.userAvatar}
                              alt={video.username}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = "https://placehold.co/100/gray/white?text=User";
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
                        </Link>
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
