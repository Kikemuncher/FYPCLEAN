"use client";

import { useEffect, useRef, useState } from "react";
import { useVideoStore } from "@/store/videoStore";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import dynamic from "next/dynamic";

// Import ReactPlayer with no SSR to avoid hydration issues
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

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
    incrementView,
  } = useVideoStore();

  // Track which videos have been viewed
  const viewedVideos = useRef<Set<string>>(new Set());
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState<boolean>(true); 
  const [isReady, setIsReady] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Handle window resize
  useEffect(() => {
    setContainerHeight(window.innerHeight);
    const updateHeight = () => setContainerHeight(window.innerHeight);
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Load more videos when scrolling
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({ threshold: 0.1 });
  
  useEffect(() => {
    if (loadMoreInView && videos.length > 0 && hasMore && !loading) {
      fetchMoreVideos();
    }
  }, [loadMoreInView, fetchMoreVideos, videos.length, hasMore, loading]);

  // Initial fetch of videos
  useEffect(() => {
    const loadVideos = async () => {
      try {
        console.log("🔄 Fetching initial videos...");
        await fetchVideos();
        console.log("✅ Videos fetched successfully");
        setIsPlaying(true);
      } catch (error) {
        console.error("❌ Failed to fetch videos:", error);
      }
    };
    
    loadVideos();
  }, [fetchVideos]);

  // Track when current video changes
  useEffect(() => {
    if (videos.length === 0) return;
    
    const currentVideo = videos[currentVideoIndex];
    if (!currentVideo) return;
    
    // Mark video as viewed and increment view count
    if (!viewedVideos.current.has(currentVideo.id)) {
      console.log(`➕ Incrementing view for video ${currentVideo.id}`);
      incrementView(currentVideo.id);
      viewedVideos.current.add(currentVideo.id);
    }
  }, [currentVideoIndex, videos, incrementView]);

  // Handle scrolling between videos
  const handleWheel = (e: React.WheelEvent) => {
    if (loading || videos.length === 0) return;
    
    if (e.deltaY > 0 && currentVideoIndex < videos.length - 1) {
      // Scroll down - next video
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (e.deltaY < 0 && currentVideoIndex > 0) {
      // Scroll up - previous video
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" && currentVideoIndex < videos.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
      } else if (e.key === "ArrowUp" && currentVideoIndex > 0) {
        setCurrentVideoIndex(currentVideoIndex - 1);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentVideoIndex, videos.length, setCurrentVideoIndex]);

  // Handle like functionality
  const toggleLike = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedVideos((prev) => {
      const newState = { ...prev, [videoId]: !prev[videoId] };
      if (newState[videoId]) likeVideo(videoId);
      return newState;
    });
  };

  // Handle play/pause toggle
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Track when a video is ready
  const handleReady = (videoId: string) => {
    console.log(`✅ Video ${videoId} is ready to play`);
    setIsReady(prev => ({...prev, [videoId]: true}));
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-black relative" onWheel={handleWheel}>
      {/* Loading indicator */}
      {loading && videos.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
        </div>
      )}

      <div className="w-full h-full flex justify-center">
        <div
          className="relative"
          style={{ 
            width: "100%", 
            maxWidth: `${containerHeight * 9/16}px`, 
            height: "100%"
          }}
        >
          <div
            className="absolute w-full transition-transform duration-300 ease-out"
            style={{
              height: containerHeight * Math.max(1, videos.length),
              transform: `translateY(-${currentVideoIndex * containerHeight}px)`
            }}
          >
            {videos.map((video, index) => {
              const isCurrentVideo = index === currentVideoIndex;
              const isVisible = Math.abs(index - currentVideoIndex) <= 1;
              
              return (
                <div
                  key={video.id}
                  className="absolute w-full"
                  style={{ height: containerHeight, top: index * containerHeight }}
                >
                  {isVisible && (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 bg-black">
                        <ReactPlayer
                          url={video.videoUrl}
                          playing={isCurrentVideo && isPlaying}
                          muted={isMuted}
                          loop
                          playsinline
                          width="100%"
                          height="100%"
                          style={{ objectFit: "cover" }}
                          config={{
                            file: {
                              attributes: {
                                preload: "auto",
                                controlsList: "nodownload",
                                disablePictureInPicture: true,
                                playsInline: true
                              },
                              forceVideo: true
                            }
                          }}
                          onReady={() => handleReady(video.id)}
                          progressInterval={5000} // Reduce updates for performance
                        />
                      </div>

                      {/* Play/Pause overlay */}
                      <div 
                        className="absolute inset-0 z-10 cursor-pointer"
                        onClick={togglePlayPause}
                      >
                        {(!isPlaying && isCurrentVideo) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="bg-black/50 rounded-full p-6">
                              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Video controls */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col space-y-4">
                        {/* Mute button */}
                        <button
                          className="bg-black/50 rounded-full p-2.5 text-white"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                            </svg>
                          )}
                        </button>

                        {/* Like button */}
                        <button
                          className={`rounded-full ${likedVideos[video.id] ? "bg-pink-500" : "bg-black/50"} p-2.5`}
                          onClick={(e) => toggleLike(video.id, e)}
                        >
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                          </svg>
                          <span className="block text-xs mt-1 text-white text-center">{video.likes || 0}</span>
                        </button>

                        {/* Comments button */}
                        <button className="bg-black/50 rounded-full p-2.5">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
                          </svg>
                          <span className="block text-xs mt-1 text-white text-center">{video.comments || 0}</span>
                        </button>

                        {/* Share button */}
                        <button className="bg-black/50 rounded-full p-2.5">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z" />
                          </svg>
                          <span className="block text-xs mt-1 text-white text-center">{video.shares || 0}</span>
                        </button>
                      </div>

                      {/* Video info */}
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                        <Link
                          href={video.creatorUid ? `/profile/${video.creatorUid}` : `/profile/${video.username}`}
                          className="flex items-center mb-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-white/30">
                            <img
                              src={video.userAvatar || "https://placehold.co/100/gray/white?text=User"}
                              alt={video.username}
                              className="w-full h-full object-cover"
                              loading="lazy"
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
            
            {/* Loading more indicator */}
            {hasMore && (
              <div ref={loadMoreRef} className="absolute bottom-20 left-0 right-0 h-10" />
            )}
          </div>
        </div>
      </div>

      {/* Global mute/unmute button */}
      <button
        className="absolute top-4 right-4 z-20 bg-black/50 p-2 rounded-full"
        onClick={() => setIsMuted(!isMuted)}
      >
        {isMuted ? (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </button>
    </div>
  );
}
