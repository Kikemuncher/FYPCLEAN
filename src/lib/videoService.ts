// src/components/feed/FeedList.tsx
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import * as videoService from "@/lib/videoService";
import * as localStorageService from "@/lib/localStorageService";
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

  // Load videos from local storage or create mock ones if empty
  useEffect(() => {
    async function loadVideos() {
      try {
        setLoading(true);
        setError(null);
        
        // Get videos from our service
        let feedVideos = videoService.getFeedVideos();
        
        if (feedVideos.length === 0) {
          // If no videos in storage, add some sample videos
          const mockVideos = [
            {
              id: "video1",
              videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-changing-lights-2532-large.mp4",
              username: "dancerX",
              userAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
              song: "Dancing Lights",
              caption: "Friday night vibes 💃",
              likes: 0,
              comments: 0,
              saves: 0,
              shares: 0,
              views: 0,
              creatorUid: "sample-user1",
              createdAt: Date.now()
            },
            {
              id: "video2",
              videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
              username: "nature_lover",
              userAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
              song: "Spring Time",
              caption: "Beautiful yellow flowers blooming 🌸",
              likes: 0,
              comments: 0,
              saves: 0,
              shares: 0,
              views: 0,
              creatorUid: "sample-user2",
              createdAt: Date.now()
            },
            {
              id: "video3",
              videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
              username: "neon_vibes",
              userAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
              song: "Neon Dreams",
              caption: "City lights 🌃",
              likes: 0,
              comments: 0,
              saves: 0,
              shares: 0,
              views: 0,
              creatorUid: "sample-user3",
              createdAt: Date.now()
            }
          ];
          
          // Save mock videos to storage
          mockVideos.forEach(video => {
            localStorageService.saveVideo(video);
          });
          
          // Get videos again after saving mocks
          feedVideos = videoService.getFeedVideos();
        }
        
        setVideos(feedVideos);
        setLoading(false);
      } catch (error) {
        console.error("Error loading videos:", error);
        setError("Unable to load videos. Please try again later.");
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
      Object.values(videoRefs.current).forEach(videoEl => {
        if (videoEl) videoEl.pause();
      });
      
      // Play current video
      const currentVideo = videoRefs.current[videos[currentVideoIndex]?.id];
      if (currentVideo) {
        currentVideo.currentTime = 0;
        currentVideo.play().catch(e => console.error("Error playing video:", e));
        
        // Increment view count
        videoService.incrementVideoView(videos[currentVideoIndex].id);
      }
    }
  }, [currentVideoIndex, videos]);

  // Handle like/unlike
  const handleLikeVideo = (videoId: string) => {
    if (!currentUser) return;
    
    const isLiked = localStorageService.isVideoLiked(currentUser.uid, videoId);
    
    if (isLiked) {
      videoService.unlikeVideo(currentUser.uid, videoId);
    } else {
      videoService.likeVideo(currentUser.uid, videoId);
    }
    
    // Update UI
    setVideos(videos.map(video => 
      video.id === videoId 
        ? { ...video, likes: isLiked ? Math.max(0, video.likes - 1) : video.likes + 1 } 
        : video
    ));
  };

  // Handle follow/unfollow
  const handleFollowUser = (creatorUid: string) => {
    if (!currentUser) return;
    
    const isFollowing = localStorageService.isFollowing(currentUser.uid, creatorUid);
    
    if (isFollowing) {
      localStorageService.unfollowUser(currentUser.uid, creatorUid);
    } else {
      localStorageService.followUser(currentUser.uid, creatorUid);
    }
    
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
          style={{ width: "100%", maxWidth: `${windowHeight * 9 / 16}px`, height: "100%" }}
        >
          {videos.map((video, index) => {
            const isLiked = currentUser ? localStorageService.isVideoLiked(currentUser.uid, video.id) : false;
            const isFollowing = currentUser && video.creatorUid ? localStorageService.isFollowing(currentUser.uid, video.creatorUid) : false;
            
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
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${isLiked ? 'text-red-500' : 'text-white'}`}>
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
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.00// src/lib/videoService.ts

import { VideoData } from '@/types/video';
import * * as localStorageService from '@/lib/localStorageService';

// Get all videos
export const getAllVideos = (): VideoData[] => {
  return localStorageService.getVideos();
};

// Get videos for feed (could implement algorithms here later)
export const getFeedVideos = (): VideoData[] => {
  const videos = localStorageService.getVideos();
  return videos.sort(() => Math.random() - 0.5); // Simple randomization for now
};

// Create a new video
export const createVideo = (
  creatorUid: string,
  videoData: Partial<VideoData>
): VideoData => {
  const creator = localStorageService.getUserProfileById(creatorUid);
  
  if (!creator) {
    throw new Error('Creator not found');
  }
  
  const newVideo: VideoData = {
    id: `video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    username: creator.username,
    userAvatar: creator.photoURL,
    caption: videoData.caption || '',
    song: videoData.song || 'Original Sound',
    likes: 0,
    comments: 0,
    saves: 0,
    shares: 0,
    views: 0,
    videoUrl: videoData.videoUrl || '',
    creatorUid: creatorUid,
    createdAt: Date.now(),
    hashtags: videoData.hashtags || []
  };
  
  // Save to storage
  localStorageService.saveVideo(newVideo);
  
  // Update creator's video count
  const updatedProfile = {
    ...creator,
    videoCount: (creator.videoCount || 0) + 1
  };
  localStorageService.saveUserProfile(updatedProfile);
  
  return newVideo;
};

// Get videos by creator
export const getVideosByCreator = (creatorUid: string): VideoData[] => {
  return localStorageService.getVideosByUser(creatorUid);
};

// Get video by ID
export const getVideoById = (videoId: string): VideoData | null => {
  const videos = localStorageService.getVideos();
  return videos.find(video => video.id === videoId) || null;
};

// Delete video
export const deleteVideo = (videoId: string, creatorUid: string): boolean => {
  const videos = localStorageService.getVideos();
  const video = videos.find(v => v.id === videoId);
  
  if (!video || video.creatorUid !== creatorUid) {
    return false; // Not found or not authorized
  }
  
  const filteredVideos = videos.filter(v => v.id !== videoId);
  // Use a different method that is definitely exported
  return localStorageService.saveVideo ? localStorageService.saveVideos(filteredVideos) : false;
  
  if (success) {
    // Update creator's video count
    const creator = localStorageService.getUserProfileById(creatorUid);
    if (creator) {
      const updatedProfile = {
        ...creator,
        videoCount: Math.max(0, (creator.videoCount || 0) - 1)
      };
      localStorageService.saveUserProfile(updatedProfile);
    }
  }
  
  return success;
};

// Like/unlike helpers
export const likeVideo = (userId: string, videoId: string): boolean => {
  const video = getVideoById(videoId);
  if (!video) return false;
  
  const success = localStorageService.likeVideo(userId, videoId);
  
  if (success) {
    // Update video likes count
    video.likes += 1;
    localStorageService.saveVideo(video);
    
    // Update creator's like count
    if (video.creatorUid) {
      const creator = localStorageService.getUserProfileById(video.creatorUid);
      if (creator) {
        const updatedProfile = {
          ...creator,
          likeCount: (creator.likeCount || 0) + 1
        };
        localStorageService.saveUserProfile(updatedProfile);
      }
    }
  }
  
  return success;
};

export const unlikeVideo = (userId: string, videoId: string): boolean => {
  const video = getVideoById(videoId);
  if (!video) return false;
  
  const success = localStorageService.unlikeVideo(userId, videoId);
  
  if (success) {
    // Update video likes count
    video.likes = Math.max(0, video.likes - 1);
    localStorageService.saveVideo(video);
    
    // Update creator's like count
    if (video.creatorUid) {
      const creator = localStorageService.getUserProfileById(video.creatorUid);
      if (creator) {
        const updatedProfile = {
          ...creator,
          likeCount: Math.max(0, (creator.likeCount || 0) - 1)
        };
        localStorageService.saveUserProfile(updatedProfile);
      }
    }
  }
  
  return success;
};

// View increment
export const incrementVideoView = (videoId: string): boolean => {
  const video = getVideoById(videoId);
  if (!video) return false;
  
  video.views += 1;
  return localStorageService.saveVideo(video);
};
