"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { VideoData } from "@/types/video";
import { FaHeart, FaComment, FaBookmark, FaShare } from "react-icons/fa";
import { useVideoStore } from "@/store/videoStore";

interface VideoCardProps {
  video: VideoData;
  isActive: boolean;
  index: number;
}

export default function VideoCard({ video, isActive, index }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { currentVideoIndex } = useVideoStore();

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
  }, [isActive]);

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
      className="absolute top-0 left-0 w-full h-full"
      initial={{ y: index > currentVideoIndex ? "100%" : "-100%" }}
      animate={{ y: isActive ? 0 : index > currentVideoIndex ? "100%" : "-100%" }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full h-full bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={video.videoUrl}
          loop
          muted
          playsInline
          preload="auto"
        />

        {/* Video info overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
          <div className="mb-2">
            <p className="font-bold text-white">@{video.username}</p>
            <p className="text-white text-sm">{video.caption}</p>
            <p className="text-white text-xs mt-1">♫ {video.song}</p>
          </div>
        </div>

        {/* Side actions */}
        <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center">
            <button className="rounded-full bg-transparent p-2">
              <FaHeart className="text-white text-2xl" />
            </button>
            <span className="text-white text-xs">{formatNumber(video.likes)}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <button className="rounded-full bg-transparent p-2">
              <FaComment className="text-white text-2xl" />
            </button>
            <span className="text-white text-xs">{formatNumber(video.comments)}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <button className="rounded-full bg-transparent p-2">
              <FaBookmark className="text-white text-2xl" />
            </button>
            <span className="text-white text-xs">{formatNumber(video.saves)}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <button className="rounded-full bg-transparent p-2">
              <FaShare className="text-white text-2xl" />
            </button>
            <span className="text-white text-xs">{formatNumber(video.shares)}</span>
          </div>
          
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden mt-2">
            <img src={video.userAvatar} alt={video.username} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
