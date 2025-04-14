// src/components/VideoPlayer/VideoPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
// Import icons
import {
  BsHeart, BsHeartFill, BsChatDots, BsShare, BsBookmark, BsBookmarkFill, BsMusicNote, BsPlus, BsCheck
} from 'react-icons/bs';
import { FaPlay, FaPause } from 'react-icons/fa';

// ... (interface VideoPlayerProps remains the same) ...
interface VideoPlayerProps {
  videoUrl: string;
  creatorUsername: string;
  creatorAvatarUrl: string;
  isFollowingCreator: boolean; // Use this as initial state
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
  shareCount?: number; // Optional based on spec
  isSaved?: boolean; // Use this as initial state
  caption: string;
  hashtags?: string[]; // Example structure
  mentions?: string[]; // Example structure
  soundName: string;
  soundImageUrl?: string; // Optional album art/icon
}


const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  creatorUsername,
  creatorAvatarUrl,
  isFollowingCreator, // Use this as initial state
  likeCount,
  isLiked, // Use this as initial state
  commentCount,
  shareCount,
  isSaved, // Use this as initial state
  caption,
  hashtags,
  mentions,
  soundName,
  soundImageUrl,
}) => {
  // Playback & Progress State
  // ... (state and refs remain the same) ...
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayPause, setShowPlayPause] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProgressVisible, setIsProgressVisible] = useState(true);
  const [isLikedByMe, setIsLikedByMe] = useState(isLiked);
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isFollowingStatus, setIsFollowingStatus] = useState(isFollowingCreator);
  const [isSavedStatus, setIsSavedStatus] = useState(isSaved ?? false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const doubleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const likeAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // ... (handlers remain the same) ...
  const handleComment = () => console.log('Open comments');
  const handleShare = () => console.log('Open share sheet');
  const handleProfileTap = () => console.log('Navigate to profile');
  const handleSoundTap = () => console.log('Navigate to sound page');
  const handleCaptionTap = () => console.log('Expand caption');

  // --- Follow Logic ---
  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFollowStatus = !isFollowingStatus;
    setIsFollowingStatus(newFollowStatus);
    console.log('Follow status toggled:', newFollowStatus);
  };

  // --- Save Logic ---
  const handleSave = () => {
    const newSaveStatus = !isSavedStatus;
    setIsSavedStatus(newSaveStatus);
    console.log('Save status toggled:', newSaveStatus);
  };

  // --- Like Logic ---
  const triggerLikeAnimation = () => {
    setShowLikeAnimation(true);
    if (likeAnimationTimeoutRef.current) clearTimeout(likeAnimationTimeoutRef.current);
    likeAnimationTimeoutRef.current = setTimeout(() => setShowLikeAnimation(false), 1000);
  };

  const handleLike = (isDoubleTap = false) => {
    // Double tap only likes, doesn't unlike
    if (isDoubleTap && isLikedByMe) {
      triggerLikeAnimation();
      return;
    }

    const newLikedState = !isLikedByMe;
    setIsLikedByMe(newLikedState);
    setCurrentLikeCount(prevCount => newLikedState ? prevCount + 1 : prevCount - 1);

    if (newLikedState) {
        if (isDoubleTap) triggerLikeAnimation();
    }
    console.log('Like toggled:', newLikedState);
  };

  // --- Progress Bar Logic ---
  const showProgressBarTemporarily = () => {
    setIsProgressVisible(true);
    if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
    progressTimeoutRef.current = setTimeout(() => setIsProgressVisible(false), 3000);
  };

  // Update progress state on time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(isNaN(currentProgress) ? 0 : currentProgress);
    }
  };

  // Show progress bar when video starts playing
  const handlePlay = () => {
    setIsPlaying(true);
    showProgressBarTemporarily();
  };

  // Keep progress bar visible while paused
  const handlePause = () => {
    setIsPlaying(false);
    if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
    setIsProgressVisible(true);
  };


  // --- Toggle Play/Pause & Double Tap ---
  const handleVideoTap = () => {
    showProgressBarTemporarily();

    // Double Tap Detection
    if (!doubleTapTimeoutRef.current) {
      // First tap - set timeout
      doubleTapTimeoutRef.current = setTimeout(() => {
        // Single Tap Action (Play/Pause)
        if (videoRef.current) {
          if (isPlaying) {
            videoRef.current.pause();
          } else {
            videoRef.current.play().catch(error => {
              console.error("Video play failed:", error);
              setIsPlaying(false);
            });
            if (videoRef.current.muted) videoRef.current.muted = false;
          }
          // Show play/pause icon
          setShowPlayPause(true);
          if (playPauseTimeoutRef.current) clearTimeout(playPauseTimeoutRef.current);
          playPauseTimeoutRef.current = setTimeout(() => setShowPlayPause(false), 800);
        }
        // Clear double tap timeout ref
        doubleTapTimeoutRef.current = null;
      }, 300); // 300ms window for double tap
    } else {
      // Second tap within the window - Double Tap Action (Like)
      clearTimeout(doubleTapTimeoutRef.current);
      doubleTapTimeoutRef.current = null;
      handleLike(true); // Trigger like with double tap flag
    }
  };

  useEffect(() => {
    showProgressBarTemporarily();
    return () => {
      if (playPauseTimeoutRef.current) clearTimeout(playPauseTimeoutRef.current);
      if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
      if (doubleTapTimeoutRef.current) clearTimeout(doubleTapTimeoutRef.current);
      if (likeAnimationTimeoutRef.current) clearTimeout(likeAnimationTimeoutRef.current);
    };
  }, []);


  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black snap-start">
      {/* 1. Core Video Display */}
      {/* Video Element */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        src={videoUrl}
        autoPlay muted loop playsInline
        onClick={handleVideoTap}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
      />

      {/* Play/Pause Overlay Icon */}
      {showPlayPause && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-black bg-opacity-50 rounded-full p-5"> {/* Increased padding slightly */}
            {/* Use FaPlay/FaPause icons */}
            {!isPlaying ? <FaPlay className="text-white text-4xl ml-1" /> : <FaPause className="text-white text-4xl" />}
          </div>
        </div>
      )}

      {/* Like Animation Overlay */}
      {showLikeAnimation && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          {/* Use BsHeartFill icon */}
          <BsHeartFill className="text-white text-8xl opacity-80 animate-like-pop" />
        </div>
      )}

      {/* Overlays Container */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 pt-safe-top pb-safe-bottom pr-safe-right pl-safe-left pointer-events-none z-10">

        {/* Top spacing (if needed, e.g., for status bar) - handled by safe area padding above */}
        <div></div> {/* Top spacing */}

        {/* Main Content Area (Bottom Info + Right Controls) */}
        {/* Main Content Area */}
        <div className="flex justify-between items-end w-full">

          {/* Bottom Info */}
          <div className="text-white pointer-events-auto max-w-[calc(100%-80px)] [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
            <div className="font-bold mb-1 cursor-pointer" onClick={handleProfileTap}>@{creatorUsername}</div>
            <div className="text-sm mb-1 cursor-pointer line-clamp-2" onClick={handleCaptionTap}>
              {caption}
              {hashtags?.map(tag => <span key={tag} className="text-blue-400 cursor-pointer hover:underline"> #{tag}</span>)}
              {mentions?.map(mention => <span key={mention} className="text-blue-400 cursor-pointer hover:underline"> @{mention}</span>)}
            </div>
            <div className="flex items-center text-sm cursor-pointer" onClick={handleSoundTap}>
              {/* Use BsMusicNote icon */}
              <BsMusicNote className="mr-2 text-lg" />
              <span className="overflow-hidden whitespace-nowrap">{soundName}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex flex-col items-center space-y-5 pointer-events-auto [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
            {/* Profile Pic / Follow - Updated */}
            <div className="relative text-center cursor-pointer" onClick={handleProfileTap}>
              <div className="w-12 h-12 rounded-full bg-gray-500 border-2 border-white mb-1 overflow-hidden">
                <img src={creatorAvatarUrl || '/default-avatar.png'} alt={`${creatorUsername} avatar`} className="w-full h-full rounded-full object-cover" />
              </div>
              {/* Follow Button Logic */}
              <div
                className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/4 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer border-2 border-black ${isFollowingStatus ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-600'}`} // Adjusted size/border
                onClick={handleFollow}
                title={isFollowingStatus ? "Following" : "Follow"}
              >
                {/* Use BsCheck/BsPlus icons */}
                {isFollowingStatus ? <BsCheck className="text-lg" /> : <BsPlus className="text-lg" />}
              </div>
            </div>

            {/* Like Button */}
            <div className="text-center cursor-pointer group" onClick={() => handleLike(false)}>
              {/* Use BsHeart/BsHeartFill icons */}
              <div className={`w-10 h-10 flex items-center justify-center text-3xl ${isLikedByMe ? 'text-red-500' : 'text-white'} group-hover:scale-110 transition-transform`}>
                {isLikedByMe ? <BsHeartFill /> : <BsHeart />}
              </div>
              <span className="text-xs text-white font-semibold">{currentLikeCount}</span>
            </div>

            {/* Comment Button */}
            <div className="text-center cursor-pointer group" onClick={handleComment}>
              {/* Use BsChatDots icon */}
              <div className="w-10 h-10 flex items-center justify-center text-3xl text-white group-hover:scale-110 transition-transform">
                <BsChatDots />
              </div>
              <span className="text-xs text-white font-semibold">{commentCount}</span>
            </div>

            {/* Share Button */}
            <div className="text-center cursor-pointer group" onClick={handleShare}>
              {/* Use BsShare icon */}
              <div className="w-10 h-10 flex items-center justify-center text-3xl text-white group-hover:scale-110 transition-transform">
                <BsShare />
              </div>
              {shareCount !== undefined && <span className="text-xs text-white font-semibold">{shareCount}</span>}
            </div>

            {/* Save/Bookmark Button - Updated */}
            {isSaved !== undefined && ( // Only render if prop is provided
              <div className="text-center cursor-pointer group" onClick={handleSave}>
                {/* Use state for styling */}
                {/* Use BsBookmark/BsBookmarkFill icons */}
                <div className={`w-10 h-10 flex items-center justify-center text-3xl ${isSavedStatus ? 'text-yellow-400' : 'text-white'} group-hover:scale-110 transition-transform`}>
                  {isSavedStatus ? <BsBookmarkFill /> : <BsBookmark />}
                </div>
              </div>
            )}

             {/* Rotating Sound Icon (Positioned near bottom right) */}
             {/* TODO: Implement rotation animation, adjust positioning */}
             {/* Added basic animation class placeholder */}
             {soundImageUrl && (
                <div className={`w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-600 mt-4 overflow-hidden ${isPlaying ? 'animate-spin-slow' : ''}`}> {/* Conditionally apply animation */}
                    <img src={soundImageUrl || '/default-sound.png'} alt="Sound cover" className="w-full h-full rounded-full object-cover"/>
                </div>
             )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className={`absolute bottom-0 left-0 w-full h-1 bg-gray-500 bg-opacity-50 pointer-events-none transition-opacity duration-300 ${isProgressVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-full bg-white" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
