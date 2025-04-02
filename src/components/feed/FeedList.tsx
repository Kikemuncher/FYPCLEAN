// src/components/feed/FeedList.tsx
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { storage } from "@/lib/firebase";
import { ref, listAll, getDownloadURL } from "firebase/storage";

function FeedList() {
  const [videos, setVideos] = useState<any[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const wheelLock = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load videos directly with better error handling
  useEffect(() => {
    async function loadVideos() {
      try {
        console.log("Loading videos directly from Firebase Storage");
        
        // Create mock videos for testing if Firebase isn't working
        const mockVideos = [
          {
            id: "video1",
            videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-changing-lights-2532-large.mp4",
            username: "dancerX",
            userAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
            song: "Dancing Lights",
            caption: "Friday night vibes 💃"
          },
          {
            id: "video2",
            videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
            username: "nature_lover",
            userAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
            song: "Spring Time",
            caption: "Beautiful yellow flowers blooming 🌸"
          },
          {
            id: "video3",
            videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
            username: "neon_vibes",
            userAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
            song: "Neon Dreams",
            caption: "City lights 🌃"
          }
        ];
        
        // Try Firebase first, fall back to mock data
        try {
          // Try to load from Storage directly
          const videosRef = ref(storage, 'videos/');
          const result = await listAll(videosRef);
          
          if (result.items.length > 0) {
            console.log(`Found ${result.items.length} videos in Firebase`);
            
            const loadedVideos = [];
            for (const item of result.items.slice(0, 5)) {
              try {
                const url = await getDownloadURL(item);
                loadedVideos.push({
                  id: item.name,
                  videoUrl: url,
                  username: "user" + Math.floor(Math.random() * 100),
                  userAvatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`,
                  song: "Original Sound",
                  caption: item.name.replace(/\.\w+$/, '').replace(/Snaptik\.app_/, '')
                });
              } catch (err) {
                console.error(`Error getting URL for ${item.name}:`, err);
              }
            }
            
            if (loadedVideos.length > 0) {
              console.log(`Successfully loaded ${loadedVideos.length} videos from Firebase`);
              setVideos(loadedVideos);
              setLoading(false);
              return;
            }
          }
          
          // If we get here, fall back to mock data
          console.log("Falling back to mock video data");
          setVideos(mockVideos);
          setLoading(false);
        } catch (firebaseError) {
          console.error("Firebase error:", firebaseError);
          console.log("Using mock videos instead");
          setVideos(mockVideos);
          setLoading(false);
        }
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
      }
    }
  }, [currentVideoIndex, videos]);

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
          {videos.map((video, index) => (
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
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                <Link
                  href={`/profile/${video.username}`}
                  className="flex items-center mb-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-white/30">
                    <img
                      src={video.userAvatar}
                      alt={video.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-white flex items-center">
                      @{video.username}
                      <span className="inline-flex ml-2 items-center justify-center rounded-full bg-pink-600/30 px-2 py-0.5 text-xs text-white">
                        Follow
                      </span>
                    </p>
                    <p className="text-white text-xs opacity-80">{video.song}</p>
                  </div>
                </Link>
                <p className="text-white text-sm mb-4">{video.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-4 bg-black/30 rounded-full p-2 z-30"
      >
        {isMuted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}

export default FeedList;
