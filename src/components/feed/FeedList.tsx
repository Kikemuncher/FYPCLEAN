import React, { useState, useEffect, useRef } from "react";
import { useVideoStore } from "@/store/videoStore";
import Link from "next/link";
import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

function FeedList() {
  const { videos, currentVideoIndex, setCurrentVideoIndex, fetchVideos } = useVideoStore();
  const [isMuted, setIsMuted] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const wheelLock = useRef(false);
  const isMounted = useRef(true);

  // Original useEffect for handling window resize
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Improved video fetching with direct Firebase access as fallback
  useEffect(() => {
    console.log("Starting to fetch videos...");
    
    const loadVideos = async () => {
      try {
        // First try using your existing fetchVideos function
        console.log("Trying to fetch videos through store...");
        await fetchVideos();
        
        // Wait a bit to see if videos loaded
        setTimeout(async () => {
          // If no videos loaded, try direct approach
          if (videos.length === 0 && isMounted.current) {
            console.log("No videos loaded from store, trying direct method");
            
            try {
              // Initialize Firebase directly with correct config
              const firebaseConfig = {
                apiKey: "AIzaSyC4SfB5JU5HyMA0KTZ1s1X6BukAaLluR1I",
                authDomain: "tiktok-a7af5.firebaseapp.com",
                projectId: "tiktok-a7af5",
                storageBucket: "tiktok-a7af5.firebasestorage.app",
                messagingSenderId: "609721475346",
                appId: "1:609721475346:web:c80084600ed104b6b153cb"
              };
              
              // Initialize a separate Firebase instance
              const app = initializeApp(firebaseConfig, 'feed-list-' + Date.now());
              const storage = getStorage(app);
              
              // List videos directly
              const videosRef = ref(storage, 'videos');
              const result = await listAll(videosRef);
              
              if (result.items.length > 0) {
                console.log(`Found ${result.items.length} videos directly`);
                
                // Get download URLs for first 5 videos (to avoid too many requests)
                const directVideos = [];
                
                for (const item of result.items.slice(0, 5)) {
                  try {
                    const url = await getDownloadURL(item);
                    directVideos.push({
                      id: item.name,
                      videoUrl: url,
                      username: "user",
                      userAvatar: "https://placehold.co/100x100",
                      song: "Song Name",
                      caption: item.name.replace(/\.\w+$/, '').replace(/Snaptik\.app_/, '')
                    });
                  } catch (err) {
                    console.error(`Error getting URL for ${item.name}:`, err);
                  }
                }
                
                if (directVideos.length > 0 && isMounted.current) {
                  // Since we can't directly modify the store, we'll use a workaround
                  console.log("Setting direct videos in page state");
                  
                  // Create temporary videos array for rendering
                  window._tempVideos = directVideos;
                  
                  // This will force the component to re-render
                  if (isMounted.current) {
                    setIsLoading(false);
                  }
                }
              } else {
                if (isMounted.current) {
                  setLoadingError("No videos found in storage");
                  setIsLoading(false);
                }
              }
            } catch (directError) {
              console.error("Error in direct loading:", directError);
              if (isMounted.current) {
                setLoadingError("Failed to load videos. Please refresh the page.");
                setIsLoading(false);
              }
            }
          } else if (videos.length > 0 && isMounted.current) {
            // Videos loaded from store successfully
            console.log("Videos loaded from store successfully");
            setIsLoading(false);
          }
        }, 3000); // Wait 3 seconds to see if store loads videos
      } catch (error) {
        console.error("Error in fetchVideos:", error);
        if (isMounted.current) {
          setLoadingError("Failed to load videos. Please refresh the page.");
          setIsLoading(false);
        }
      }
    };
    
    loadVideos();
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [fetchVideos, videos.length]);

  // Wheel event handling for video navigation
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (wheelLock.current) return;
    wheelLock.current = true;
    
    // Use either store videos or temporary direct videos
    const videosToUse = videos.length > 0 ? videos : (window._tempVideos || []);
    
    if (e.deltaY > 0 && currentVideoIndex < videosToUse.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (e.deltaY < 0 && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
    setTimeout(() => {
      wheelLock.current = false;
    }, 800);
  };

  // Current video controls effect - play current, pause others
  useEffect(() => {
    // Use either store videos or temporary direct videos
    const videosToUse = videos.length > 0 ? videos : (window._tempVideos || []);
    
    if (videosToUse.length > 0) {
      // Pause all videos first
      Object.values(videoRefs.current).forEach(videoEl => {
        if (videoEl) {
          videoEl.pause();
        }
      });
      
      // Play the current video
      const currentVideo = videoRefs.current[videosToUse[currentVideoIndex]?.id];
      if (currentVideo) {
        currentVideo.currentTime = 0;
        const playPromise = currentVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.error("Error playing video:", e));
        }
      }
    }
  }, [currentVideoIndex, videos]);

  // Improved loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-white rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading videos...</p>
          <p className="text-white text-xs mt-2 opacity-70">This may take a moment</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadingError) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="bg-red-500/20 backdrop-blur-sm p-4 rounded-lg max-w-md text-center">
          <p className="text-white mb-3">{loadingError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use either store videos or temporary direct videos
  const videosToRender = videos.length > 0 ? videos : (window._tempVideos || []);

  // No videos state with retry button
  if (videosToRender.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="text-center">
          <p className="text-white mb-3">No videos found</p>
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

  // Render videos - using the original rendering logic
  return (
    <div className="fixed inset-0 bg-black" style={{ height: `${windowHeight}px` }} onWheel={handleWheel}>
      <div className="w-full h-full flex justify-center">
        <div
          className="relative"
          style={{ width: "100%", maxWidth: `${windowHeight * 9 / 16}px`, height: "100%" }}
        >
          {videosToRender.map((video, index) => (
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
                      <span className="inline-flex ml-2 items-center justify-center rounded-full bg-tiktok-pink/30 px-2 py-0.5 text-xs text-white">
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

// Add this for TypeScript
declare global {
  interface Window {
    _tempVideos?: any[];
  }
}

export default FeedList;
