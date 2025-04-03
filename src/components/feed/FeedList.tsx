// src/components/feed/FeedList.tsx
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import * as videoService from "@/lib/videoService";
import { VideoData } from "@/types/video";

function FeedList() {
  const { currentUser } = useAuth();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const wheelLock = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load videos from Firebase
  useEffect(() => {
    async function loadVideos() {
      try {
        setLoading(true);
        setError(null);

        // Get videos from Firebase directly
        const firebaseVideos = await videoService.getFeedVideos();

        if (firebaseVideos.length === 0) {
          setError("No videos available from Firebase");
        } else {
          setVideos(firebaseVideos);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading Firebase videos:", error);
        setError("Unable to load videos from Firebase. Please try again later.");
        setLoading(false);
      }
    }

    // Load videos
    loadVideos();

    // Set window height for vertical scrolling
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle wheel events for scrolling between videos
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (wheelLock.current) return;
    wheelLock.current = true;

    const maxIndex = videos.length - 1;

    if (e.deltaY > 0 && currentVideoIndex < maxIndex) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (e.deltaY < 0 && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }

    setTimeout(() => {
      wheelLock.current = false;
    }, 800);
  };

  // Handle video playback for current video
  useEffect(() => {
    if (videos.length > 0) {
      // Pause all videos
      Object.values(videoRefs.current).forEach((videoEl) => {
        if (videoEl) videoEl.pause();
      });

      // Play current video
      const currentVideo = videoRefs.current[videos[currentVideoIndex]?.id];
      if (currentVideo) {
        currentVideo.currentTime = 0;
        currentVideo.play().catch((e) => console.error("Error playing video:", e));

        // Increment view count
        videoService.incrementVideoView(videos[currentVideoIndex].id);
      }
    }
  }, [currentVideoIndex, videos]);

  // Handle like/unlike
  const handleLikeVideo = (videoId: string) => {
    if (!currentUser) return;

    videoService.likeVideo(currentUser.uid, videoId);

    // Update UI
    setVideos(
      videos.map((video) =>
        video.id === videoId
          ? { ...video, likes: video.likes + 1 }
          : video
      )
    );
  };

  // Handle follow/unfollow
  const handleFollowUser = (creatorUid: string) => {
    if (!currentUser) return;

    // TODO: Implement Firebase follow/unfollow logic
    console.log(`Follow/unfollow user ${creatorUid}`);

    // Force re-render
    setVideos([...videos]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="text-center">
          <p className="text-white mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // No videos state
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <p className="text-white">No videos available</p>
      </div>
    );
  }

  // Main render with videos
  return (
    <div className="fixed inset-0 bg-black" style={{ height: `${windowHeight}px` }} onWheel={handleWheel}>
      <div className="w-full h-full flex justify-center">
        <div
          className="relative"
          style={{ width: "100%", maxWidth: `${(windowHeight * 9) / 16}px`, height: "100%" }}
        >
          {videos.map((video, index) => {
            const isLiked = false; // TODO: Implement Firebase like status check
            const isFollowing = false; // TODO: Implement Firebase follow status check

            return (
              <div
                key={video.id}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${
                  index === currentVideoIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[video.id] = el;
                  }}
                  src={video.videoUrl}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  muted={isMuted}
                  autoPlay={index === currentVideoIndex}
                />

                {/* Video Controls */}
                <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6">
                  {/* Like Button */}
                  <button
                    onClick={() => handleLikeVideo(video.id)}
                    className="flex flex-col items-center"
                  >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${isLiked ? "text-red-500" : "text-white"}`}>
                      <svg
                        className="w-6 h-6"
                        fill={isLiked ? "currentColor" : "none"}
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
                    <span className="text-white text-xs mt-1">{video.likes}</span>
                  </button>

                  {/* Comment Button */}
                  <button className="flex flex-col items-center">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full text-white">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.80
