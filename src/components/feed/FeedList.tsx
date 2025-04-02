// Update the video fetching logic to focus on direct loading
import React, { useState, useEffect, useRef } from "react";
import { useVideoStore } from "@/store/videoStore";
import Link from "next/link";
import { storage } from "@/lib/firebase";
import { ref, listAll, getDownloadURL } from "firebase/storage";

function FeedList() {
  const { videos, currentVideoIndex, setCurrentVideoIndex } = useVideoStore();
  const [isMuted, setIsMuted] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const wheelLock = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [directVideos, setDirectVideos] = useState<any[]>([]);

  // Load videos directly from Firebase Storage
  useEffect(() => {
    async function loadDirectVideos() {
      try {
        setLoading(true);
        console.log("Attempting direct video loading");
        
        // Try to load from Storage directly
        const videosRef = ref(storage, 'videos/');
        const result = await listAll(videosRef);
        
        if (result.items.length === 0) {
          console.log("No videos found in storage");
          setError("No videos found");
          setLoading(false);
          return;
        }
        
        console.log(`Found ${result.items.length} videos, getting URLs`);
        
        // Process first 5 videos
        const loadedVideos = [];
        for (const item of result.items.slice(0, 5)) {
          try {
            console.log(`Getting URL for ${item.name}`);
            const url = await getDownloadURL(item);
            loadedVideos.push({
              id: item.name,
              videoUrl: url,
              username: "user",
              userAvatar: "https://placehold.co/100x100",
              song: "Original Sound",
              caption: item.name
            });
          } catch (err) {
            console.error(`Error getting URL for ${item.name}:`, err);
          }
        }
        
        if (loadedVideos.length > 0) {
          console.log(`Loaded ${loadedVideos.length} videos directly`);
          setDirectVideos(loadedVideos);
          setLoading(false);
        } else {
          setError("Could not load any videos");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in direct loading:", error);
        setError("Error loading videos");
        setLoading(false);
      }
    }
    
    loadDirectVideos();
  }, []);

  // Handle window height for vertical scrolling
  useEffect(() => {
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
    
    // Use direct videos since store might not be working
    const videosToUse = directVideos;
    const maxIndex = videosToUse.length - 1;
    
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
    const videosToUse = directVideos;
    if (videosToUse.length > 0) {
      // Pause all videos
      Object.values(videoRefs.current).forEach(videoEl => {
        if (videoEl) videoEl.pause();
      });
      
      // Play current video
      const currentVideo = videoRefs.current[videosToUse[currentVideoIndex]?.id];
      if (currentVideo) {
        currentVideo.currentTime = 0;
        currentVideo.play().catch(e => console.error("Error playing video:", e));
      }
    }
  }, [currentVideoIndex, directVideos]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <p className="text-white">Loading videos...</p>
      </div>
    );
  }

  // Error state
  if (error && directVideos.length === 0) {
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
  if (directVideos.length === 0) {
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
          {directVideos.map((video, index) => (
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
