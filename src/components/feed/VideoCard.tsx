"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactPlayer from "react-player/lazy";
import { VideoData } from "@/types/video";
import { FaHeart, FaComment, FaBookmark, FaShare, FaMusic } from "react-icons/fa";
import { useInView } from "react-intersection-observer";
import { increaseViewCount } from "@/lib/firebaseService";

interface VideoCardProps {
  video: VideoData;
  isActive: boolean;
  index: number;
}

export default function VideoCard({ video, isActive, index }: VideoCardProps) {
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  
  const { ref, inView } = useInView({
    threshold: 0.7,
  });

  // Control play state based on inView and isActive
  useEffect(() => {
    if (isActive && inView) {
      setPlaying(true);
      // Track view in Firebase
      increaseViewCount(video.id);
    } else {
      setPlaying(false);
    }
  }, [isActive, inView, video.id]);

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
          style={{ objectFit: "cover", position: "absolute", top: 0, left: 0 }}
          config={{
            file: {
              attributes: {
                style: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                },
              },
            },
          }}
        />

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

        {/* Play/Pause indicator */}
        {!playing && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-full bg-black/50 p-4">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
