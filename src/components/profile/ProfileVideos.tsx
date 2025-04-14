// src/components/profile/ProfileVideos.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getVideosByUsername } from '@/lib/videoService';
import { VideoData } from '@/types/video';

type ProfileVideosProps = {
  username: string;
};

export default function ProfileVideos({ username }: ProfileVideosProps) {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const videosPerPage = 12;

  // Add debug logs
  console.log("ProfileVideos component for username:", username);

  const loadVideos = async (pageNum = 1, reset = false) => {
    if (!username) {
      console.warn("No username provided to ProfileVideos");
      setError("Username not provided");
      setLoading(false);
      return;
    }

    try {
      console.log(`Fetching videos for ${username}, page ${pageNum}`);
      setLoading(true);
      
      const offset = (pageNum - 1) * videosPerPage;
      const results = await getVideosByUsername(username, offset, videosPerPage);
      
      console.log(`Received ${results.length} videos for ${username}`);
      
      if (results.length < videosPerPage) {
        setHasMore(false);
      }
      
      setVideos(prev => reset ? results : [...prev, ...results]);
      setError(null);
    } catch (err) {
      console.error('Error fetching user videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("ProfileVideos useEffect triggered with username:", username);
    setVideos([]);
    setPage(1);
    setHasMore(true);
    loadVideos(1, true);
  }, [username]);

  const loadMoreVideos = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadVideos(nextPage);
  };

  if (loading && videos.length === 0) {
    return (
      <div className="py-8">
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-tiktok-pink"></div>
        </div>
      </div>
    );
  }

  if (error && videos.length === 0) {
    return (
      <div className="py-8">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="py-16">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-300">No videos yet</h3>
          <p className="mt-2 text-gray-500">This user hasn't posted any videos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="border-b border-zinc-800 pb-4 mb-6">
        <h2 className="text-lg font-medium text-white">Videos</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {videos.map((video) => (
          <Link key={video.id} href={`/?video=${video.id}`}>
            <div className="relative aspect-[9/16] overflow-hidden rounded-md bg-zinc-800 group">
              <video
                src={video.videoUrl}
                className="w-full h-full object-cover"
                muted
                playsInline
                onMouseOver={(e) => {
                  try {
                    (e.target as HTMLVideoElement).play().catch(err => console.log('Video play error:', err));
                  } catch (err) {
                    console.error('Error playing video', err);
                  }
                }}
                onMouseOut={(e) => {
                  try {
                    const video = e.target as HTMLVideoElement;
                    video.pause();
                    video.currentTime = 0;
                  } catch (err) {
                    console.error('Error pausing video', err);
                  }
                }}
                onError={(e) => {
                  // Handle video loading errors
                  (e.target as HTMLElement).classList.add('error');
                  const parent = (e.target as HTMLElement).parentElement;
                  if (parent) {
                    // Create an error message
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm';
                    errorMsg.textContent = 'Video unavailable';
                    parent.appendChild(errorMsg);
                  }
                }}
              />
              
              {/* Video caption overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white text-xs truncate">{video.caption || 'Video'}</p>
              </div>
              
              {/* Video stats overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 text-white text-xs">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span>{video.views || 0} views</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMoreVideos}
            disabled={loading}
            className="px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
