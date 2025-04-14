'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getFeedVideos, getVideoById } from '@/lib/videoService';
import { VideoData } from '@/types/video';
import VideoFeed from '../video/VideoFeed';

export default function FeedVideos() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const videoParam = searchParams?.get('video');
  
  useEffect(() => {
    async function loadFeedVideos() {
      try {
        setLoading(true);
        const { videos } = await getFeedVideos(undefined, 20);
        
        // If a specific video was requested via URL param
        if (videoParam) {
          const videoExists = videos.some(v => v.id === videoParam);
          
          if (!videoExists) {
            const specificVideo = await getVideoById(videoParam);
            if (specificVideo) {
              setVideos([specificVideo, ...videos]);
              return;
            }
          }
        }
        
        setVideos(videos);
      } catch (err) {
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    }
    
    loadFeedVideos();
  }, [videoParam]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-black">
        <div className="bg-zinc-900 p-6 rounded-lg">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (videos.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-black">
        <div className="bg-zinc-900 p-6 rounded-lg text-center">
          <h3 className="text-white text-xl mb-2">No videos found</h3>
          <p className="text-gray-400 mb-4">There are no videos yet. Be the first to upload!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="feed-container h-screen overflow-y-scroll snap-y snap-mandatory">
      <VideoFeed videos={videos} initialVideoId={videoParam || undefined} />
    </div>
  );
}
