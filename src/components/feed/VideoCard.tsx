"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactPlayer from "react-player/lazy";
import { VideoData } from "@/types/video";
import { FaHeart, FaComment, FaBookmark, FaShare, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { useInView } from "react-intersection-observer";

interface VideoCardProps {
  video: VideoData;
  isActive: boolean;
  index: number;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
}

export default function VideoCard({ video, isActive, index, onNavigatePrev, onNavigateNext }: VideoCardProps) {
  // Simple state management
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const playerRef = useRef<ReactPlayer>(null);
  
  const { ref, inView } = useInView({
    threshold: 0.7,
  });

  // Auto-play when active
  useEffect(() => {
    if (isActive && inView) {
      // Add a slight delay before playing
      const timer = setTimeout(() => {
        setPlaying(true);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setPlaying(false);
    }
  }, [isActive, inView]);

  // Handle video click
  const handleVideoClick = () => {
    setPlaying(!playing);
  };

  return (
    <motion.div
      ref={ref}
      className="absolute inset-0"
      initial={{ y: "100%" }}
      animate={{ y: isActive ? 0 : index < currentVideoIndex ? "-100%" : "100%" }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative w-full h-full bg-black" onClick={handleVideoClick}>
        {/* Loading spinner */}
        {isActive && loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="h-14 w-14 flex items-center justify-center">
              <div className="animate-spin rounded-full h-14 w-14 border-2 border-t-white border-b-transparent"></div>
            </div>
          </div>
        )}

        {/* Video Player */}
        <ReactPlayer
          ref={playerRef}
          url={video.videoUrl}
          playing={playing}
          loop
          width="100%"
          height="100%"
          playsinline
          muted={false}
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
          onReady={() => setLoading(false)}
          onBuffer={() => setLoading(true)}
          onBufferEnd={() => setLoading(false)}
        />

        {/* Video info overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
          <div className="mb-2">
            <p className="font-bold text-white">@{video.username}</p>
            <p className="text-white text-sm">{video.caption}</p>
          </div>
        </div>

        {/* Side actions - reduced spacing */}
        <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center">
            <button 
              className="rounded-full bg-transparent p-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <FaHeart className="text-2xl text-white" />
            </button>
            <span className="text-white text-xs">0</span>
          </div>
          
          <div className="flex flex-col items-center">
            <button 
              className="rounded-full bg-transparent p-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <FaComment className="text-white text-2xl" />
            </button>
            <span className="text-white text-xs">0</span>
          </div>
          
          <div className="flex flex-col items-center">
            <button 
              className="rounded-full bg-transparent p-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <FaBookmark className="text-2xl text-white" />
            </button>
            <span className="text-white text-xs">0</span>
          </div>
          
          <div className="flex flex-col items-center">
            <button 
              className="rounded-full bg-transparent p-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <FaShare className="text-white text-2xl" />
            </button>
            <span className="text-white text-xs">0</span>
          </div>
        </div>

        {/* Play/Pause indicator */}
        {!playing && !loading && isActive && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="rounded-full bg-black/40 p-3 backdrop-blur-sm border border-white/20">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Navigation buttons - positioned to match right side icons */}
        <div className="absolute left-2 bottom-20 flex flex-col space-y-4 z-30">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onNavigatePrev();
            }}
            className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2.5"
          >
            <FaChevronUp className="text-xl" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onNavigateNext();
            }}
            className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2.5"
          >
            <FaChevronDown className="text-xl" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
