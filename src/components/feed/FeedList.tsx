import React, { useState, useEffect, useRef } from "react";
import { useVideoStore } from "@/store/videoStore";
import Link from "next/link";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

function FeedList() {
  const { videos, currentVideoIndex, setCurrentVideoIndex, fetchVideos } = useVideoStore();
  const [isMuted, setIsMuted] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const wheelLock = useRef(false);
  const isMounted = useRef(true);

  // Improved video fetching with timeout protection and progressive loading
  useEffect(() => {
    console.log("Starting to fetch videos...");
    
    const loadVideos = async () => {
      try {
        // Try the normal way first through your store
        console.log("Calling fetchVideos from videoStore");
        await fetchVideos();
        console.log("fetchVideos completed, videos loaded:", videos.length);
        
        // Set a timer to check if videos loaded
        setTimeout(() => {
          if (isMounted.current) {
            if (videos.length > 0) {
              console.log("Videos loaded successfully from store");
              setIsLoading(false);
            } else {
              console.log("No videos loaded from store after 5s");
              setLoadingError("Failed to load videos. Please refresh the page.");
              setIsLoading(false);
            }
          }
        }, 5000);
      } catch (error) {
        console.error("Error in fetchVideos:", error);
        if (isMounted.current) {
          setLoadingError("Failed to load videos. Please refresh the page.");
          setIsLoading(false);
        }
      }
    };
    
    loadVideos();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted.current = false;
    };
  }, [fetchVideos]);

  // Video check effect - when videos are available, ensure loading is false
  useEffect(() => {
    if (videos.length > 0 && isLoading) {
      console.log("Videos detected, ending loading state");
      setIsLoading(false);
    }
  }, [videos.length, isLoading]);

  // Original useEffect for handling window resize
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Wheel event handling for video navigation
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (wheelLock.current) return;
    wheelLock.current = true;
    if (e.deltaY > 0 && currentVideoIndex < videos.length - 1) {
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
    if (videos.length > 0) {
      // Pause all videos first
      Object.values(videoRefs.current).forEach(videoEl => {
        if (videoEl) {
          videoEl.pause();
        }
      });
      
      // Play the current video
      const currentVideo = videoRefs.current[videos[currentVideoIndex]?.id];
      if (currentVideo) {
        currentVideo.currentTime = 0;
        const playPromise = currentVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.error("Error playing video:", e));
        }
      }
    }
  }, [currentVideoIndex, videos]);

  // Manual retry function that users can call if videos don't load
  const handleRetry = () => {
    setIsLoading(true);
    setLoadingError(null);
    
    // Direct loading approach
    const directLoad = async () => {
      try {
        console.log("Trying direct loading approach");
        const videosRef = ref(storage, 'videos/');
        
        const result = await listAll(videosRef);
        console.log(`Found ${result.items.length} videos directly`);
        
        if (result.items.length === 0) {
          setLoadingError("No videos found in storage.");
          setIsLoading(false);
          return;
        }
        
        // Just trigger a refresh since we can't directly update the store
        window.location.reload();
      } catch (error) {
        console.error("Error in direct loading:", error);
        setLoadingError("Failed to load videos. Please try again later.");
        setIsLoading(false);
      }
    };
    
    // Wait a bit then try direct approach
    setTimeout(() => {
      if (videos.length === 0 && isMounted.current) {
        directLoad();
      }
    }, 2000);
  };

  // Improved loading state
  if (isLoading && videos.length === 0) {
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
  if (loadingError && videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="bg-red-500/20 backdrop-blur-sm p-4 rounded-lg max-w-md text-center">
          <p className="text-white mb-3">{loadingError}</p>
          <button 
            onClick={handleRetry}
            className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No videos state with retry button
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="text-center">
          <p className="text-white mb-3">No videos found</p>
          <button 
            onClick={handleRetry}
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

export default FeedList;
