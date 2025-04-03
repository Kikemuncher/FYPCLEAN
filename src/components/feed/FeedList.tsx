// src/components/feed/FeedList.tsx
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import * as videoService from "@/lib/videoService";
import { VideoData } from "@/types/video";
// Remove localStorageService import

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

        // Get videos from Firebase
        const firebaseVideos = await videoService.getFeedVideos();

        if (firebaseVideos.length === 0) {
          setError("No videos available");
        } else {
          setVideos(firebaseVideos);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading videos:", error);
        setError("Unable to load videos. Please try again later.");
        setLoading(false);
      }
    }

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
  const handleLikeVideo = async (videoId: string) => {
    if (!currentUser) return;

    try {
      // Check if video is liked by querying Firestore
      const isLiked = await videoService.isVideoLikedByUser(currentUser.uid, videoId);

      if (isLiked) {
        await videoService.unlikeVideo(currentUser.uid, videoId);
      } else {
        await videoService.likeVideo(currentUser.uid, videoId);
      }

      // Update UI
      setVideos(
        videos.map((video) =>
          video.id === videoId
            ? { ...video, likes: isLiked ? Math.max(0, video.likes - 1) : video.likes + 1 }
            : video
        )
      );
    } catch (error) {
      console.error("Error handling like/unlike:", error);
    }
  };

  // Handle follow/unfollow
  const handleFollowUser = async (creatorUid: string) => {
    if (!currentUser) return;

    try {
      // Check if user is following creator
      const { isFollowing } = useAuth();
      const following = isFollowing(creatorUid);

      if (following) {
        await useAuth().unfollowUser(creatorUid);
      } else {
        await useAuth().followUser(creatorUid);
      }

      // Force re-render
      setVideos([...videos]);
    } catch (error) {
      console.error("Error handling follow/unfollow:", error);
    }
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
            // We need to implement isVideoLikedByUser and isFollowing from auth context
            const [isLiked, setIsLiked] = useState(false);
            const [isFollowing, setIsFollowing] = useState(false);
            
            // Check if video is liked and user is following when component mounts
            useEffect(() => {
              if (currentUser && video.id) {
                videoService.isVideoLikedByUser(currentUser.uid, video.id)
                  .then(liked => setIsLiked(liked))
                  .catch(err => console.error("Error checking like status:", err));
                
                if (video.creatorUid) {
                  setIsFollowing(useAuth().isFollowing(video.creatorUid));
                }
              }
            }, [currentUser, video.id, video.creatorUid]);

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
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <span className="text-white text-xs mt-1">{video.comments}</span>
                  </button>

                  {/* Share Button */}
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
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    </div>
                    <span className="text-white text-xs mt-1">{video.shares}</span>
                  </button>
                </div>

                {/* User and Video Info */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                  <Link
                    href={`/profile/${video.username}`}
                    className="flex items-center mb-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-white/30">
                      <img src={video.userAvatar} alt={video.username} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-white flex items-center">
                        @{video.username}
                        {video.creatorUid && currentUser && video.creatorUid !== currentUser.uid && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (video.creatorUid) {
                                handleFollowUser(video.creatorUid);
                              }
                            }}
                            className={`inline-flex ml-2 items-center justify-center rounded-full px-2 py-0.5 text-xs text-white ${
                              isFollowing ? "bg-gray-600" : "bg-pink-600"
                            }`}
                          >
                            {isFollowing ? "Following" : "Follow"}
                          </button>
                        )}
                      </p>
                      <p className="text-white text-xs opacity-80">{video.song}</p>
                    </div>
                  </Link>
                  <p className="text-white text-sm mb-4">{video.caption}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mute/Unmute Button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-4 bg-black/30 rounded-full p-2 z-30"
      >
        {isMuted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}

export default FeedList;
