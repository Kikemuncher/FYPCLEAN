"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Static data for videos
const VIDEOS = [
  {
    id: "video1",
    url: "https://assets.mixkit.co/videos/preview/mixkit-young-mother-with-her-little-daughter-decorating-a-christmas-tree-39745-large.mp4",
    username: "mixkit_user",
    caption: "Christmas decorations with family #holidays",
    song: "Holiday Vibes",
    userAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    likes: 45600,
    comments: 1230
  },
  {
    id: "video2",
    url: "https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4",
    username: "nature_lover",
    caption: "Nature day with marshmallows 🌿 #outdoors #camping",
    song: "Nature Sounds",
    userAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
    likes: 34500,
    comments: 980
  },
  {
    id: "video3",
    url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
    username: "neon_vibes",
    caption: "Neon lights at night ✨ #aesthetic #nightlife",
    song: "Neon Dreams",
    userAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
    likes: 78900,
    comments: 2340
  }
];

function FeedList() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [likedVideos, setLikedVideos] = useState({});
  
  // Prevent scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  
  // Reference for wheel lock
  const wheelLockTimer = useRef(null);
  const wheelLocked = useRef(false);
  
  // Format large numbers
  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };
  
  // Handle wheel event
  const handleWheel = (e) => {
    e.preventDefault();
    
    if (wheelLocked.current) return;
    
    wheelLocked.current = true;
    
    if (e.deltaY > 0 && currentVideoIndex < VIDEOS.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
    }
    
    // Unlock after delay
    clearTimeout(wheelLockTimer.current);
    wheelLockTimer.current = setTimeout(() => {
      wheelLocked.current = false;
    }, 800); // Longer delay to prevent rapid scrolling
  };
  
  // Toggle mute
  const toggleMute = () => setIsMuted(!isMuted);
  
  // Handle like
  const handleLike = (videoId, e) => {
    e.stopPropagation();
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' && currentVideoIndex < VIDEOS.length - 1) {
        setCurrentVideoIndex(prev => prev + 1);
      } else if (e.key === 'ArrowUp' && currentVideoIndex > 0) {
        setCurrentVideoIndex(prev => prev - 1);
      } else if (e.key === 'm') {
        toggleMute();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex]);
  
  return (
    <div 
      className="h-screen w-full overflow-hidden bg-black relative"
      onWheel={handleWheel}
    >
      {/* Side Navigation */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 flex flex-col space-y-6">
        <button className="flex flex-col items-center">
          <div className="rounded-full bg-black/30 p-2 hover:bg-black/50">
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3 17v-10l9 5-9 5z"/>
            </svg>
          </div>
          <span className="text-white text-xs mt-1">For You</span>
        </button>
        
        <button className="flex flex-col items-center">
          <div className="rounded-full bg-black/30 p-2 hover:bg-black/50">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-white text-xs mt-1">Following</span>
        </button>
      </div>
      
      {/* Video Container */}
      <div className="w-full h-full flex justify-center">
        <div 
          className="relative"
          style={{ 
            width: "100%",
            maxWidth: "500px", // Fixed width instead of aspect ratio calculation
            height: "100%"
          }}
        >
          {VIDEOS.map((video, index) => (
            <div 
              key={video.id}
              className="absolute top-0 left-0 w-full h-full transition-opacity duration-300"
              style={{ 
                opacity: index === currentVideoIndex ? 1 : 0,
                zIndex: index === currentVideoIndex ? 1 : 0,
                pointerEvents: index === currentVideoIndex ? 'auto' : 'none'
              }}
            >
              <video
                src={video.url}
                className="w-full h-full object-cover"
                loop
                playsInline
                autoPlay
                muted={isMuted}
              />
              
              {/* Video info */}
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="flex items-center mb-2">
                  <Link href={`/profile/${video.username}`} className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                      <img 
                        src={video.userAvatar}
                        alt={video.username} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                  
                  <div className="ml-3 flex-1">
                    <Link href={`/profile/${video.username}`}>
                      <p className="font-bold text-white">
                        @{video.username}
                      </p>
                    </Link>
                    <p className="text-gray-300 text-sm">{video.song}</p>
                  </div>
                  
                  <button className="ml-2 px-3 py-1 bg-tiktok-pink rounded-full text-white text-sm font-medium">
                    Follow
                  </button>
                </div>
                
                <p className="text-white text-sm mb-4">{video.caption}</p>
              </div>
              
              {/* Side actions */}
              <div className="absolute right-3 bottom-24 flex flex-col items-center space-y-5">
                <button 
                  className="flex flex-col items-center"
                  onClick={(e) => handleLike(video.id, e)}
                >
                  <div className="rounded-full bg-black/30 p-2">
                    <svg 
                      className={`h-8 w-8 ${likedVideos[video.id] ? 'text-red-500' : 'text-white'}`} 
                      fill={likedVideos[video.id] ? "currentColor" : "none"} 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="text-white text-xs mt-1">{formatCount(video.likes)}</span>
                </button>
                
                <button className="flex flex-col items-center">
                  <div className="rounded-full bg-black/30 p-2">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="text-white text-xs mt-1">{formatCount(video.comments)}</span>
                </button>
                
                <button className="flex flex-col items-center">
                  <div className="rounded-full bg-black/30 p-2">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <span className="text-white text-xs mt-1">Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Sound toggle button */}
      <button 
        onClick={toggleMute}
        className="absolute top-4 right-4 bg-black/30 rounded-full p-2 z-30"
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      <div className="absolute top-4 left-4 bg-black/30 rounded-full px-3 py-1 z-30">
        <span className="text-white text-sm">{currentVideoIndex + 1} / {VIDEOS.length}</span>
      </div>
    </div>
  );

export default FeedList;
