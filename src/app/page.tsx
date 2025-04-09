'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { VideoPlayer } from '@/components/VideoPlayer';
import { SideNav } from '@/components/SideNav';

// Video component for better organization
const VideoItem = ({ video, isActive }) => {
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(err => console.log('Autoplay failed:', err));
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive]);
  
  return (
    <div className="h-screen w-full flex flex-col relative bg-black">
      <video
        ref={videoRef}
        src={video.url}
        className="absolute inset-0 w-full h-full object-contain z-10"
        loop
        controls
        muted={!isActive}
        playsInline
      />
      
      {/* Video overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-start">
          <div className="flex-1">
            <p className="font-bold text-white">{video.name || 'Untitled'}</p>
            <p className="text-sm text-gray-300">{video.description || 'No description'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const feedRef = useRef(null);
  
  // Load videos from Firebase Storage
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log("Fetching videos from Firebase Storage...");
        
        // List videos from Firebase Storage
        const videosRef = ref(storage, 'videos');
        const videosList = await listAll(videosRef);
        
        if (videosList.items.length === 0) {
          setError("No videos found in storage. Please upload some videos.");
          setLoading(false);
          return;
        }
        
        // Get download URLs for videos
        const videoPromises = videosList.items.map(async (item) => {
          try {
            const url = await getDownloadURL(item);
            // Get the video name by removing path and file extension
            const name = item.name.split('/').pop().replace(/\.[^/.]+$/, "");
            return {
              id: item.name,
              name: name || item.name,
              url: url,
            };
          } catch (e) {
            console.error(`Error getting URL for ${item.name}:`, e);
            return null;
          }
        });
        
        const fetchedVideos = (await Promise.all(videoPromises)).filter(v => v !== null);
        
        if (fetchedVideos.length === 0) {
          setError("Could not load any videos. Please check your storage permissions.");
        } else {
          setVideos(fetchedVideos);
        }
      } catch (err) {
        console.error("Error loading videos:", err);
        setError(`Failed to load videos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, []);
  
  // Handle scroll to determine active video
  useEffect(() => {
    if (!feedRef.current) return;
    
    const handleScroll = () => {
      if (!feedRef.current) return;
      
      const scrollTop = feedRef.current.scrollTop;
      const videoHeight = window.innerHeight;
      const index = Math.round(scrollTop / videoHeight);
      
      setActiveVideoIndex(index);
    };
    
    const feedElement = feedRef.current;
    feedElement.addEventListener('scroll', handleScroll);
    
    return () => {
      feedElement.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Side Navigation */}
      <SideNav />
      
      {/* Main Content */}
      <div className="ml-64 flex-1 overflow-hidden">
        {error && (
          <div className="bg-red-900/30 border border-red-500 p-3 mx-4 mt-4 rounded">
            <p className="text-red-400">{error}</p>
            <div className="mt-3">
              <button 
                onClick={() => window.location.reload()} 
                className="text-sm bg-pink-500 hover:bg-pink-600 px-3 py-1 rounded"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        <div
          ref={feedRef}
          className="h-screen overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {videos.length > 0 ? (
            videos.map((video, index) => (
              <div key={video.id} className="snap-start h-screen w-full">
                <VideoItem video={video} isActive={activeVideoIndex === index} />
              </div>
            ))
          ) : (
            <div className="h-screen flex items-center justify-center">
              <div className="max-w-md text-center p-6 bg-zinc-900 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">No Videos Found</h2>
                <p className="text-gray-400 mb-4">Try uploading some videos or check your Firebase Storage</p>
                <Link href="/upload" className="bg-pink-500 text-white px-4 py-2 rounded-md inline-block">
                  Upload Video
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
