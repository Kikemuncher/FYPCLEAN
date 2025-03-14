"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactPlayer from "react-player/lazy";
import { VideoData } from "@/types/video";
import { FaHeart, FaComment, FaBookmark, FaShare, FaMusic, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { useInView } from "react-intersection-observer";

interface VideoCardProps {
  video: VideoData;
  isActive: boolean;
  index: number;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
}

export default function VideoCard({ video, isActive, index, onNavigatePrev, onNavigateNext }: VideoCardProps) {
  // Core states
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Simplified loading states to fix the issues
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const playerRef = useRef<ReactPlayer>(null);
  
  const { ref, inView } = useInView({
    threshold: 0.7,
  });

  // Auto play the video when it becomes active
  useEffect(() => {
    if (isActive && inView) {
      // Always start fresh when becoming active
      setHasError(false);
      setIsLoading(true);
      
      // Auto play after a short delay
      const playTimer = setTimeout(() => {
        setPlaying(true);
      }, 500);
      
      return () => clearTimeout(playTimer);
    } else {
      setPlaying(false);
    }
  }, [isActive, inView]);

  // Handle video click - toggle play/pause or retry
  const handleVideoClick = () => {
    if (hasError) {
      handleRetry();
    } else {
      setPlaying(!playing);
    }
  };

  // Handle retry button click
  const handleRetry = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    // Reset video states
    setHasError(false);
    setIsLoading(true);
    
    // Try to reset the player
    if (playerRef.current) {
      try {
        playerRef.current.seekTo(0);
      } catch (err) {
        console.error("Error seeking video:", err);
      }
    }
    
    // Start playing after delay
    setTimeout(() => {
      setPlaying(true);
    }, 1000);
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
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
        {/* Loading spinner - only show during loading */}
        {isActive && isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="h-12 w-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-white border-r-white border-b-transparent border-l-transparent"></div>
            </div>
          </div>
        )}

        {/* Video player */}
        <ReactPlayer
          ref={playerRef}
          url={video.videoUrl}
          playing={playing}
          loop
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
            console.error(`Video ${index} error:`, e);
            setHasError(true);
            setIsLoading(false);
          }}
          onReady={() => {
            console.log(`Video ${index} ready`);
            setIsLoading(false);
          }}
          onStart={() => {
            console.log(`Video ${index} started playing`);
            setIsLoading(false);
            setHasError(false);
          }}
        />

        {/* Error message */}
        {isActive && hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="text-white text-center p-4 bg-black/70 rounded-lg max-w-xs">
              <p className="mb-3">Unable to play this video.</p>
              <button 
                className="bg-tiktok-pink text-white px-4 py-2 rounded-full text-sm font-semibold"
                onClick={handleRetry}
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

        {/* Play/Pause indicator - only when not loading and not in error state */}
        {!playing && !isLoading && isActive && !hasError && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="rounded-full bg-black/40 p-3 backdrop-blur-sm border border-white/20">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
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
