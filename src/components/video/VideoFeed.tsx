// src/components/video/VideoFeed.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { VideoData } from '@/types/video';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { incrementVideoView, toggleVideoLike, fetchUserLikedVideos } from '@/lib/videoService';

// Import icons
import {
  BsHeart, BsHeartFill, BsChatDots, BsShare, BsBookmark, BsBookmarkFill, BsMusicNote, BsPlus, BsCheck,
  BsVolumeMute, BsVolumeUp // Volume icons
} from 'react-icons/bs';
import { FaPlay, FaPause } from 'react-icons/fa';

// --- Interface for the main component ---
interface VideoFeedProps {
  videos: VideoData[];
  initialVideoId?: string | null;
}

// --- Interface for the single video player internal component ---
interface SingleVideoPlayerProps {
  video: VideoData;
  isActive: boolean;
  isLikedByCurrentUser: boolean;
  onLikeToggle: (videoId: string) => Promise<void>;
}

// --- Single Video Player Component (Browser Adapted) ---
const SingleVideoPlayer: React.FC<SingleVideoPlayerProps> = ({
  video,
  isActive,
  isLikedByCurrentUser,
  onLikeToggle,
}) => {
  // Auth and router for follow logic (fix for follow button)
  const { currentUser } = useAuth();
  const router = useRouter();
  // Playback & Core State
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayPause, setShowPlayPause] = useState(false); // For tap feedback icon
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  // Progress & Seeking State (Re-integrated for hover controls)
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isProgressVisible, setIsProgressVisible] = useState(false); // For bottom bar auto-hide

  // Volume State (Re-integrated for hover controls)
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false); // Separate from volume for toggle

  // Hover State for Controls
  const [showHoverControls, setShowHoverControls] = useState<boolean>(false);

  // Interaction State (Like, Follow, Save - from new spec)
  // Note: Follow/Save need data source beyond VideoData currently
  const [isFollowingStatus, setIsFollowingStatus] = useState(false); // Placeholder
  const [isSavedStatus, setIsSavedStatus] = useState(false); // Placeholder

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const doubleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const likeAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timeout for hiding hover controls

  // Track if user has interacted with the page
  const hasUserInteracted = useRef(false);

  useEffect(() => {
    const setInteracted = () => {
      hasUserInteracted.current = true;
      window.removeEventListener('click', setInteracted);
      window.removeEventListener('keydown', setInteracted);
      window.removeEventListener('touchstart', setInteracted);
    };
    window.addEventListener('click', setInteracted, { once: true });
    window.addEventListener('keydown', setInteracted, { once: true });
    window.addEventListener('touchstart', setInteracted, { once: true });
    return () => {
      window.removeEventListener('click', setInteracted);
      window.removeEventListener('keydown', setInteracted);
      window.removeEventListener('touchstart', setInteracted);
    };
  }, []);

  // --- Effects ---
  useEffect(() => {
    // Play/Pause based on isActive
    if (videoRef.current) {
      if (isActive) {
        // If user has interacted, try to play unmuted; otherwise, play muted
        if (hasUserInteracted.current) {
          videoRef.current.muted = false;
        } else {
          videoRef.current.muted = true;
        }
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          if (videoRef.current) {
            videoRef.current.volume = volume;
            setIsMuted(videoRef.current.muted);
          }
          incrementVideoView(video.id);
        }).catch(error => {
          // If play fails, fallback to muted
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
        setIsProgressVisible(false);
      }
    }
  }, [isActive, video.id, volume, isMuted]);

  useEffect(() => {
    // Cleanup timeouts
    return () => {
      if (playPauseTimeoutRef.current) clearTimeout(playPauseTimeoutRef.current);
      if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
      if (doubleTapTimeoutRef.current) clearTimeout(doubleTapTimeoutRef.current);
      if (likeAnimationTimeoutRef.current) clearTimeout(likeAnimationTimeoutRef.current);
      if (hoverControlsTimeoutRef.current) clearTimeout(hoverControlsTimeoutRef.current);
    };
  }, []);

  // --- Handlers ---
  const handleComment = () => console.log('Open comments for video:', video.id);
  const handleShare = () => {
    console.log('Open share sheet for video:', video.id);
    if (navigator.share) {
      navigator.share({ title: video.caption || 'Check out this video', url: `${window.location.origin}/?video=${video.id}` })
        .catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/?video=${video.id}`);
      alert("Link copied to clipboard!");
    }
  };
  const handleCaptionTap = () => console.log('Expand caption');

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowingStatus(prev => !prev);
    console.log('TODO: API call to follow/unfollow user:', video.username);
  };
  const handleSave = () => {
    setIsSavedStatus(prev => !prev);
    console.log('TODO: API call to save/unsave video:', video.id);
  };

  // Like Logic
  const triggerLikeAnimation = () => {
    setShowLikeAnimation(true);
    if (likeAnimationTimeoutRef.current) clearTimeout(likeAnimationTimeoutRef.current);
    likeAnimationTimeoutRef.current = setTimeout(() => setShowLikeAnimation(false), 1000);
  };
  const handleLike = async (isDoubleTap = false) => {
    if (isDoubleTap && isLikedByCurrentUser) {
      triggerLikeAnimation(); return;
    }
    const wasLiked = isLikedByCurrentUser;
    try {
      await onLikeToggle(video.id);
      if (!wasLiked && isDoubleTap) triggerLikeAnimation();
    } catch (error) { console.error("Liking video failed:", error); }
  };

  // Progress Bar Auto-Hide Logic (For thin bottom bar)
  const showProgressBarTemporarily = () => {
    setIsProgressVisible(true);
    if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
    progressTimeoutRef.current = setTimeout(() => setIsProgressVisible(false), 3000);
  };

  // Video Element Event Handlers
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoElement = e.currentTarget;
    const currentProgress = (videoElement.currentTime / videoElement.duration) * 100;
    setProgress(isNaN(currentProgress) ? 0 : currentProgress);
    setCurrentTime(videoElement.currentTime);
    setDuration(videoElement.duration || 0); // Update duration as well
  };
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
     setDuration(e.currentTarget.duration || 0); // Set initial duration
  };
  const handlePlay = () => { setIsPlaying(true); showProgressBarTemporarily(); };
  const handlePause = () => {
    setIsPlaying(false);
    if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
    setIsProgressVisible(true); // Keep thin bar visible when paused
  };

  // Hover Controls Handlers (Volume, Seek)
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const videoElement = videoRef.current;
    if (!videoElement) return;
    const newMuted = !videoElement.muted;
    videoElement.muted = newMuted;
    setIsMuted(newMuted);
    // If unmuting, ensure volume is not 0
    if (!newMuted && videoElement.volume === 0) {
        videoElement.volume = 0.5; // Default to 50% volume if unmuting from 0
        setVolume(0.5);
    }
  };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const videoElement = videoRef.current;
    const newVolume = parseFloat(e.target.value);
    if (videoElement) {
      videoElement.volume = newVolume;
      videoElement.muted = newVolume === 0;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };
  // (removed duplicate handleSeek for hover controls)

  // Combined Tap Handler (Play/Pause & Double Tap Like)
  const handleVideoTap = () => {
    showProgressBarTemporarily(); // Show thin bar on tap
    if (!doubleTapTimeoutRef.current) {
      doubleTapTimeoutRef.current = setTimeout(() => {
        if (videoRef.current) {
          if (isPlaying) videoRef.current.pause();
          else {
            videoRef.current.play().catch(error => { console.error("Video play failed on tap:", error); setIsPlaying(false); });
            // Unmute on manual play tap if currently muted
            if (videoRef.current.muted) {
                videoRef.current.muted = false;
                setIsMuted(false);
                // Ensure volume isn't 0 when unmuting
                if (videoRef.current.volume === 0) {
                    videoRef.current.volume = 0.5;
                    setVolume(0.5);
                }
            }
          }
          setShowPlayPause(true); // Show visual feedback
          if (playPauseTimeoutRef.current) clearTimeout(playPauseTimeoutRef.current);
          playPauseTimeoutRef.current = setTimeout(() => setShowPlayPause(false), 800);
        }
        doubleTapTimeoutRef.current = null;
      }, 300);
    } else {
      clearTimeout(doubleTapTimeoutRef.current);
      doubleTapTimeoutRef.current = null;
      handleLike(true); // Double tap = Like
    }
  };

  // Hover Controls Visibility
  const handleMouseEnter = () => {
      if (hoverControlsTimeoutRef.current) clearTimeout(hoverControlsTimeoutRef.current);
      setShowHoverControls(true);
  };
  const handleMouseLeave = () => {
      // Delay hiding controls slightly
      hoverControlsTimeoutRef.current = setTimeout(() => {
          setShowHoverControls(false);
      }, 300);
  };

  // Format Time Helper
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };


  // --- Render Logic ---
  return (
    // Container for a single video, takes full height of its parent scroll snap item
    <div
      className="relative h-full w-full overflow-hidden bg-black flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Flex row: video and right controls */}
      <div className="flex flex-row items-center justify-center w-full h-full">
        {/* Video Element and overlays */}
        <div className="relative flex items-center justify-center h-full py-8">
          <div className="w-full h-full aspect-[9/16] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-contain z-0 rounded-2xl"
              src={video.videoUrl}
              loop
              playsInline
              muted={isMuted}
              onClick={handleVideoTap}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={handlePlay}
              onPause={handlePause}
              poster={video.thumbnailUrl || undefined}
              preload="auto"
            />
          </div>

          {/* Play/Pause Overlay (Tap Feedback) */}
          {showPlayPause && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="bg-black bg-opacity-50 rounded-full p-5">
                {!isPlaying ? <FaPlay className="text-white text-4xl ml-1" /> : <FaPause className="text-white text-4xl" />}
              </div>
            </div>
          )}

          {/* Like Animation Overlay (Double Tap Feedback) */}
          {showLikeAnimation && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <BsHeartFill className="text-white text-8xl opacity-80 animate-like-pop" />
            </div>
          )}

          {/* Bottom Info Overlay */}
          <div className="absolute left-0 bottom-0 p-4 pointer-events-none z-10 w-full flex flex-row">
            <div className="text-white pointer-events-auto max-w-[calc(100%-100px)] [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
              <Link href={`/profile/${video.username}`} className="block font-bold mb-1 cursor-pointer hover:underline">
                  @{video.username}
              </Link>
              <div className="text-sm mb-1 cursor-pointer line-clamp-2" onClick={handleCaptionTap}>
                {video.caption}
              </div>
              <Link href={`/sound/${video.song}`} className="flex items-center text-sm cursor-pointer hover:underline">
                <BsMusicNote className="mr-2 text-lg" />
                <span className="overflow-hidden whitespace-nowrap">{video.song || 'Original Sound'}</span>
              </Link>
            </div>
          </div>

          {/* Thin Progress Indicator (Bottom Edge - Auto Hide) */}
          <div className={`absolute bottom-0 left-0 w-full h-1 bg-gray-500 bg-opacity-50 pointer-events-none transition-opacity duration-300 ${isProgressVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="h-full bg-white" style={{ width: `${progress}%` }}></div>
          </div>

          {/* (removed old hover controls container) */}
        </div>

        {/* Right Controls Stack - OUTSIDE video, vertically centered */}
        {/* Right Controls Stack - absolutely positioned near bottom right */}
        <div className="flex flex-col items-center space-y-5 ml-6 mb-8 pointer-events-auto [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] self-end">
          {/* Profile Pic / Follow */}
          <div className="relative text-center">
            <Link href={`/profile/${video.username}`} className="block">
              <div className="w-12 h-12 rounded-full bg-gray-500 border-2 border-white mb-1 overflow-hidden">
                <img src={video.userAvatar || '/default-avatar.png'} alt={`${video.username} avatar`} className="w-full h-full rounded-full object-cover" />
              </div>
            </Link>
            {/* Follow Button: If not signed in, always show "+" and redirect to login on click */}
            { !currentUser ? (
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/4 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer border-2 border-black bg-red-500 hover:bg-red-600"
                onClick={(e) => { e.stopPropagation(); router.push('/auth/login'); }}
                title="Sign in to follow"
              >
                <BsPlus className="text-lg" />
              </div>
            ) : (
              <div
                className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/4 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer border-2 border-black ${isFollowingStatus ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-600'}`}
                onClick={handleFollow}
                title={isFollowingStatus ? "Following" : "Follow"}
              >
                {isFollowingStatus ? <BsCheck className="text-lg" /> : <BsPlus className="text-lg" />}
              </div>
            )}
          </div>
          {/* Like Button */}
          <div className="text-center cursor-pointer group" onClick={() => handleLike(false)}>
            <div className={`w-10 h-10 flex items-center justify-center text-3xl ${isLikedByCurrentUser ? 'text-red-500' : 'text-white'} group-hover:scale-110 transition-transform`}>
              {isLikedByCurrentUser ? <BsHeartFill /> : <BsHeart />}
            </div>
            <span className="text-xs text-white font-semibold">{video.likes ?? 0}</span>
          </div>
          {/* Comment Button */}
          <div className="text-center cursor-pointer group" onClick={handleComment}>
            <div className="w-10 h-10 flex items-center justify-center text-3xl text-white group-hover:scale-110 transition-transform"> <BsChatDots /> </div>
            <span className="text-xs text-white font-semibold">{video.comments ?? 0}</span>
          </div>
          {/* Share Button */}
          <div className="text-center cursor-pointer group" onClick={handleShare}>
            <div className="w-10 h-10 flex items-center justify-center text-3xl text-white group-hover:scale-110 transition-transform"> <BsShare /> </div>
            <span className="text-xs text-white font-semibold">{video.shares ?? 0}</span>
          </div>
          {/* Save/Bookmark Button */}
          <div className="text-center cursor-pointer group" onClick={handleSave}>
            <div className={`w-10 h-10 flex items-center justify-center text-3xl ${isSavedStatus ? 'text-yellow-400' : 'text-white'} group-hover:scale-110 transition-transform`}>
              {isSavedStatus ? <BsBookmarkFill /> : <BsBookmark />}
            </div>
          </div>
           {/* Rotating Sound Icon */}
           <Link href={`/sound/${video.song}`} className="block">
              <div className={`w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-600 mt-4 overflow-hidden ${isActive && isPlaying ? 'animate-spin-slow' : ''}`}>
                  <img src={video.userAvatar || '/default-sound.png'} alt="Sound cover" className="w-full h-full rounded-full object-cover"/>
              </div>
           </Link>
        </div>
      </div>
    </div>
  );
  // --- Seek Bar Drag State ---
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Seek Bar Handlers ---
  const handleSeekStart = () => {
    setIsSeeking(true);
    if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
  };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    const seekTimeValue = parseFloat(e.target.value);
    setSeekTime(seekTimeValue);
    videoElement.currentTime = seekTimeValue;
    setCurrentTime(seekTimeValue);
    showProgressBarTemporarily();
  };
  const handleSeekEnd = () => {
    setIsSeeking(false);
    seekTimeoutRef.current = setTimeout(() => setSeekTime(null), 1200);
  };

  // Cleanup seek timeout
  useEffect(() => {
    return () => {
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
    };
  }, []);

  // --- Render Logic ---
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-black flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Flex row: video and right controls */}
      <div className="flex flex-row items-end justify-center w-full h-full">
        {/* Video Element and overlays */}
        <div className="relative flex-1 flex items-center justify-center h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-contain z-0"
            src={video.videoUrl}
            loop
            playsInline
            muted={isMuted}
            onClick={handleVideoTap}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={handlePlay}
            onPause={handlePause}
            poster={video.thumbnailUrl || undefined}
            preload="auto"
          />

          {/* Play/Pause Overlay (Tap Feedback) */}
          {showPlayPause && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="bg-black bg-opacity-50 rounded-full p-5">
                {!isPlaying ? <FaPlay className="text-white text-4xl ml-1" /> : <FaPause className="text-white text-4xl" />}
              </div>
            </div>
          )}

          {/* Like Animation Overlay (Double Tap Feedback) */}
          {showLikeAnimation && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <BsHeartFill className="text-white text-8xl opacity-80 animate-like-pop" />
            </div>
          )}

          {/* Bottom Info Overlay */}
          <div className="absolute left-0 bottom-0 p-4 pointer-events-none z-10 w-full flex flex-row">
            <div className="text-white pointer-events-auto max-w-[calc(100%-100px)] [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
              <Link href={`/profile/${video.username}`} className="block font-bold mb-1 cursor-pointer hover:underline">
                  @{video.username}
              </Link>
              <div className="text-sm mb-1 cursor-pointer line-clamp-2" onClick={handleCaptionTap}>
                {video.caption}
              </div>
              <Link href={`/sound/${video.song}`} className="flex items-center text-sm cursor-pointer hover:underline">
                <BsMusicNote className="mr-2 text-lg" />
                <span className="overflow-hidden whitespace-nowrap">{video.song || 'Original Sound'}</span>
              </Link>
            </div>
          </div>

          {/* Thin Progress Indicator (Bottom Edge - Auto Hide) */}
          <div className={`absolute bottom-0 left-0 w-full pointer-events-auto z-30`}>
            {/* Seek Bar (thin, always at bottom, auto-hides) */}
            <input
              type="range"
              min="0"
              max={duration || 1}
              step="0.1"
              value={isSeeking && seekTime !== null ? seekTime : currentTime}
              onChange={handleSeek}
              onMouseDown={handleSeekStart}
              onMouseUp={handleSeekEnd}
              onTouchStart={handleSeekStart}
              onTouchEnd={handleSeekEnd}
              className={`w-full accent-white h-1.5 cursor-pointer transition-opacity duration-300 ${isProgressVisible || isSeeking ? 'opacity-100' : 'opacity-0'}`}
              style={{ backgroundSize: `${progress}% 100%` }}
            />
            {/* Show time above bar only while seeking */}
            {isSeeking && seekTime !== null && (
              <div className="absolute left-1/2 bottom-6 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded z-40 pointer-events-none">
                {formatTime(seekTime)} / {formatTime(duration)}
              </div>
            )}
          </div>
        </div>

        {/* Right Controls Stack - OUTSIDE video, vertically lower */}
        <div className="flex flex-col items-center space-y-5 pointer-events-auto [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] ml-4 mb-12">
          {/* Profile Pic / Follow */}
          <div className="relative text-center">
            <Link href={`/profile/${video.username}`} className="block">
              <div className="w-12 h-12 rounded-full bg-gray-500 border-2 border-white mb-1 overflow-hidden">
                <img src={video.userAvatar || '/default-avatar.png'} alt={`${video.username} avatar`} className="w-full h-full rounded-full object-cover" />
              </div>
            </Link>
            {/* Follow Button: If not signed in, always show "+" and redirect to login on click */}
            { !currentUser ? (
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/4 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer border-2 border-black bg-red-500 hover:bg-red-600"
                onClick={(e) => { e.stopPropagation(); router.push('/auth/login'); }}
                title="Sign in to follow"
              >
                <BsPlus className="text-lg" />
              </div>
            ) : (
              <div
                className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/4 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer border-2 border-black ${isFollowingStatus ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-600'}`}
                onClick={handleFollow}
                title={isFollowingStatus ? "Following" : "Follow"}
              >
                {isFollowingStatus ? <BsCheck className="text-lg" /> : <BsPlus className="text-lg" />}
              </div>
            )}
          </div>
          {/* Like Button */}
          <div className="text-center cursor-pointer group" onClick={() => handleLike(false)}>
            <div className={`w-10 h-10 flex items-center justify-center text-3xl ${isLikedByCurrentUser ? 'text-red-500' : 'text-white'} group-hover:scale-110 transition-transform`}>
              {isLikedByCurrentUser ? <BsHeartFill /> : <BsHeart />}
            </div>
            <span className="text-xs text-white font-semibold">{video.likes ?? 0}</span>
          </div>
          {/* Comment Button */}
          <div className="text-center cursor-pointer group" onClick={handleComment}>
            <div className="w-10 h-10 flex items-center justify-center text-3xl text-white group-hover:scale-110 transition-transform"> <BsChatDots /> </div>
            <span className="text-xs text-white font-semibold">{video.comments ?? 0}</span>
          </div>
          {/* Share Button */}
          <div className="text-center cursor-pointer group" onClick={handleShare}>
            <div className="w-10 h-10 flex items-center justify-center text-3xl text-white group-hover:scale-110 transition-transform"> <BsShare /> </div>
            <span className="text-xs text-white font-semibold">{video.shares ?? 0}</span>
          </div>
          {/* Save/Bookmark Button */}
          <div className="text-center cursor-pointer group" onClick={handleSave}>
            <div className={`w-10 h-10 flex items-center justify-center text-3xl ${isSavedStatus ? 'text-yellow-400' : 'text-white'} group-hover:scale-110 transition-transform`}>
              {isSavedStatus ? <BsBookmarkFill /> : <BsBookmark />}
            </div>
          </div>
           {/* Rotating Sound Icon */}
           <Link href={`/sound/${video.song}`} className="block">
              <div className={`w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-600 mt-4 overflow-hidden ${isActive && isPlaying ? 'animate-spin-slow' : ''}`}>
                  <img src={video.userAvatar || '/default-sound.png'} alt="Sound cover" className="w-full h-full rounded-full object-cover"/>
              </div>
           </Link>
        </div>
      </div>
    </div>
  );
};


// --- Main VideoFeed Component (Wrapper - Mostly Unchanged) ---
export default function VideoFeed({ videos, initialVideoId }: VideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialVideoId) {
      const index = videos.findIndex(v => v.id === initialVideoId);
      return index >= 0 ? index : 0;
    }
    return 0;
  });
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  // Fetch liked videos
  useEffect(() => {
    const fetchLikedVideos = async () => {
      if (!currentUser || authLoading) { setLikedVideos(new Set()); return; }
      try {
        const likedVideosArray = await fetchUserLikedVideos(currentUser.uid);
        setLikedVideos(new Set(likedVideosArray));
      } catch (error) { console.error("Error fetching liked videos:", error); }
    };
    fetchLikedVideos();
  }, [currentUser, authLoading]);

  // Handle Like Toggle API call
  const handleLikeVideo = async (videoId: string) => {
    if (!currentUser) { alert("Please sign in to like videos"); return; }
    const currentlyLiked = likedVideos.has(videoId);
    // Optimistic UI Update
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (currentlyLiked) newSet.delete(videoId); else newSet.add(videoId);
      return newSet;
    });
    try {
      await toggleVideoLike(videoId, currentUser.uid);
    } catch (error) {
      console.error("Error liking video:", error);
      alert("Failed to like video.");
      // Revert UI on error
      setLikedVideos(prev => {
         const newSet = new Set(prev);
         if (currentlyLiked) newSet.add(videoId); else newSet.delete(videoId);
         return newSet;
      });
    }
  };

  // Update currentIndex based on URL change (driven by parent observer)
   useEffect(() => {
    if (initialVideoId) {
      const index = videos.findIndex(v => v.id === initialVideoId);
      if (index !== -1 && index !== currentIndex) setCurrentIndex(index);
    }
   }, [initialVideoId, videos, currentIndex]);

  // Render the list
  return (
    <>
      {videos.map((video, index) => (
        // Parent FeedVideos.tsx provides the h-screen scroll-snap container
        <div
          key={video.id}
          className="video-wrapper snap-start snap-always h-full w-full flex items-center justify-center" // Use h-full
          id={`video-${video.id}`}
        >
          <SingleVideoPlayer
            video={video}
            isActive={index === currentIndex}
            isLikedByCurrentUser={likedVideos.has(video.id)}
            onLikeToggle={handleLikeVideo}
          />
        </div>
      ))}
    </>
  );
}
