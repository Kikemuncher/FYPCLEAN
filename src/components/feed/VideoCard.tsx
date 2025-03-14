"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactPlayer from "react-player/lazy";
import { VideoData } from "@/types/video";
import { FaHeart, FaComment, FaBookmark, FaShare, FaMusic, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { useInView } from "react-intersection-observer";
import { increaseViewCount } from "@/lib/firebaseService";

interface VideoCardProps {
  video: VideoData;
  isActive: boolean;
  index: number;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
}

export default function VideoCard({ video, isActive, index, onNavigatePrev, onNavigateNext }: VideoCardProps) {
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  
  const { ref, inView } = useInView({
    threshold: 0.7,
  });

  // Debug video info
  useEffect(() => {
    console.log(`Video ${index} source:`, video.videoUrl);
    console.log(`Video ${index} active:`, isActive);
  }, [video, isActive, index]);

  // Control play state based on inView and isActive
  useEffect(() => {
    if (isActive && inView) {
      // Give a longer delay to ensure video is loaded before playing
      // This helps prevent immediate error states on first load
      const timer = setTimeout(() => {
        setPlaying(true);
        // Track view in Firebase
        try {
          increaseViewCount(video.id);
        } catch (error) {
          console.error("Error tracking view:", error);
        }
      }, 1000); // Increased delay for better loading
      
      return () => clearTimeout(timer);
    } else {
      setPlaying(false);
    }
  }, [isActive, inView, video.id]);

  // Initialize with loading state and hide errors initially
  useEffect(() => {
    if (isActive) {
      console.log(`Attempting to load video at index ${index}`);
      
      // Reset states on becoming active
      setVideoReady(false);
      
      // Always hide error initially to avoid showing it too early
      setError(false);
    }
  }, [isActive, index]);

  const handleVideoClick = () => {
    setPlaying(!playing);
  };

  const handleLike = () => {
    setLiked(!liked);
    // Update likes in Firebase
  };

  const handleSave = () => {
    setSaved(!saved);
    // Update saves in Firebase
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <motion.div
      ref={ref}
      className="absolute top-0 left-0 w-full h-full"
      initial={{ y: index > 0 ? "100%" : 0 }}
      animate={{ y: isActive ? 0 : index > 0 ? "100%" : "-100%" }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full h-full bg-black" onClick={handleVideoClick}>
        {/* Show loading state until video is ready - with consistent size */}
        {isActive && !videoReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="h-12 w-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          </div>
        )}

        <ReactPlayer
          ref={playerRef}
          url={video.videoUrl}
          playing={playing}
          loop
          muted={false}
          width="100%"
          height="100%"
          playsinline
          controls={false}
          config={{
            file: {
              forceVideo: true,
              attributes: {
                style: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                },
                playsInline: true,
              },
            },
          }}
          style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            objectFit: "cover",
            width: "100%",
            height: "100%"
          }}
          onError={(e) => {
            console.error("Video playback error:", e, video.videoUrl);
            // Only show error if we've attempted to play and still failed
            // This gives time for video to load first
            setTimeout(() => {
              if (isActive && !videoReady) {
                setError(true);
              }
            }, 2000);
          }}
          onReady={() => {
            console.log(`Video ${index} ready to play`);
            setError(false);
            setVideoReady(true);
          }}
          onBuffer={() => {
            console.log(`Video ${index} buffering`);
            // Don't set videoReady to false during buffering
            // This prevents flickering of the loading indicator
          }}
          onBufferEnd={() => {
            console.log(`Video ${index} buffer ended`);
            setVideoReady(true);
          }}
        />

        {/* Error message - only show if there's an error and the video is active */}
        {error && isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="text-white text-center p-4 bg-black/80 rounded-lg">
              <p className="mb-2">Unable to play video. Please try again later.</p>
              <button 
                className="bg-tiktok-pink text-white px-4 py-2 rounded-full text-sm font-semibold"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent click from triggering parent handlers
                  setError(false);
                  setVideoReady(false); // Show loading again
                  if (playerRef.current) {
                    playerRef.current.seekTo(0);
                  }
                  // Give more time for video to load
                  setTimeout(() => {
                    setPlaying(true);
                  }, 1500);
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Video info overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
          <div className="mb-2">
            <p className="font-bold text-white">@{video.username}</p>
            <p className="text-white text-sm">{video.caption}</p>
            <div className="flex items-center mt-2">
              <FaMusic className="text-white mr-2" />
              <p className="text-white text-xs">{video.song}</p>
            </div>
          </div>
        </div>

        {/* Side actions */}
        <div className="absolute right-2 bottom-24 flex flex-col items-center space-y-6">
          <div className="flex flex-col items-center">
            <button 
              className="rounded-full bg-transparent p-2"
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
            >
              <FaHeart className={`text-2xl ${liked ? 'text-red-500' : 'text-white'}`} />
            </button>
            <span className="text-white text-xs">{formatNumber(video.likes)}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <button 
              className="rounded-full bg-transparent p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <FaComment className="text-white text-2xl" />
            </button>
            <span className="text-white text-xs">{formatNumber(video.comments)}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <button 
              className="rounded-full bg-transparent p-2"
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
            >
              <FaBookmark className={`text-2xl ${saved ? 'text-yellow-500' : 'text-white'}`} />
            </button>
            <span className="text-white text-xs">{formatNumber(video.saves)}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <button 
              className="rounded-full bg-transparent p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <FaShare className="text-white text-2xl" />
            </button>
            <span className="text-white text-xs">{formatNumber(video.shares)}</span>
          </div>
          
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden mt-2">
            <img src={video.userAvatar} alt={video.username} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Play/Pause indicator - smaller translucent circular button */}
        {!playing && videoReady && isActive && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="rounded-full bg-black/40 p-4 backdrop-blur-sm border border-white/20">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Navigation buttons - moved to left side */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-30">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onNavigatePrev();
            }}
            className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
          >
            <FaChevronUp className="text-xl" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onNavigateNext();
            }}
            className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
          >
            <FaChevronDown className="text-xl" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
