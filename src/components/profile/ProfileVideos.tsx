'use client';

// src/components/profile/ProfileVideos.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/firebase';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Video {
  id: string;
  url: string;
  thumbnail?: string;
  caption: string;
}

type ProfileVideosProps = {
  username: string;
};

export default function ProfileVideos({ username }: ProfileVideosProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserVideos() {
      try {
        setLoading(true);
        setError(null);
        
        // First try to fetch videos from Firestore where creator matches username
        const videosRef = collection(db, 'videos');
        const q = query(
          videosRef, 
          where('username', '==', username),
          orderBy('timestamp', 'desc'), 
          limit(20)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Videos found in Firestore
          const videoData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              url: data.url,
              thumbnail: data.thumbnail,
              caption: data.caption || '',
            };
          });
          
          setVideos(videoData);
          setLoading(false);
          return;
        }
        
        // If no videos found in Firestore, try fetching from Storage directly
        // This is a fallback and may not be accurate for per-user videos
        const videosStorageRef = ref(storage, 'videos/');
        const result = await listAll(videosStorageRef);
        
        if (result.items.length === 0) {
          setVideos([]);
          setLoading(false);
          return;
        }
        
        // Get download URLs and create video objects
        const videoPromises = result.items.map(async (item) => {
          try {
            const url = await getDownloadURL(item);
            return {
              id: item.name,
              url,
              thumbnail: url, // In a real app, you'd generate/store thumbnails
              caption: item.name.replace(/\.\w+$/, '').replace(/Snaptik\.app_/, '')
            };
          } catch (err) {
            console.error(`Error getting URL for ${item.name}:`, err);
            return null;
          }
        });
        
        const videoResults = await Promise.all(videoPromises);
        const validVideos = videoResults.filter(Boolean) as Video[];
        
        setVideos(validVideos);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user videos:', err);
        setError('Failed to load videos');
        setLoading(false);
      }
    }
    
    fetchUserVideos();
  }, [username]);

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-tiktok-pink"></div>
        </div>
      </div>
    );
  }

  if (error) {
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
          <div key={video.id} className="relative aspect-[9/16] overflow-hidden rounded-md bg-zinc-800">
            <Link href={`/?video=${video.id}`}>
              <div className="absolute inset-0">
                <video
                  src={video.url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-10 transition-opacity">
                  <div className="absolute bottom-2 left-2 text-white text-xs">
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      <span>View</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
