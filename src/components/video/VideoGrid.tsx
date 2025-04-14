'use client';

import React from 'react';
import Link from 'next/link';
import { VideoData } from '@/types/video';

interface VideoGridProps {
  videos: VideoData[];
  onVideoClick?: (videoId: string) => void;
}

export default function VideoGrid({ videos, onVideoClick }: VideoGridProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No videos available</p>
      </div>
    );
  }

  const handleVideoClick = (videoId: string) => {
    if (onVideoClick) {
      onVideoClick(videoId);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {videos.map(video => (
        <Link 
          key={video.id} 
          href={`/?video=${video.id}`}
          onClick={(e) => {
            if (onVideoClick) {
              e.preventDefault();
              handleVideoClick(video.id);
            }
          }}
        >
          <div className="relative aspect-[9/16] bg-gray-100 overflow-hidden rounded-lg">
            <img
              src={video.thumbnailUrl || 'https://via.placeholder.com/300x500?text=Video'}
              alt={video.caption || 'Video thumbnail'}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm truncate">{video.caption}</p>
              
              <div className="flex items-center mt-1">
                <div className="flex items-center mr-3">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                  </svg>
                  <span className="text-white text-xs ml-1">{video.likes}</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm3.5-9c.8 0 1.5-.7 1.5-1.5S16.3 8 15.5 8 14 8.7 14 9.5s.7 1.5 1.5 1.5zm-7 0c.8 0 1.5-.7 1.5-1.5S9.3 8 8.5 8 7 8.7 7 9.5 7.7 11 8.5 11zm3.5 7c2.4 0 4.5-1.3 5.7-3.3H6.3c1.2 2 3.3 3.3 5.7 3.3z" />
                  </svg>
                  <span className="text-white text-xs ml-1">{video.views || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
