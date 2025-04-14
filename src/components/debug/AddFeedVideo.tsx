'use client';

import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function AddFeedVideo() {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleAddSampleVideo = async () => {
    if (!currentUser) {
      alert('You must be logged in to add a video');
      return;
    }
    
    setLoading(true);
    setSuccess(false);
    
    try {
      // Sample videos that should work reliably
      const sampleVideos = [
        {
          url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          caption: 'Big Buck Bunny'
        },
        {
          url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          caption: 'Elephants Dream'
        },
        {
          url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          caption: 'For Bigger Blazes'
        },
        {
          url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          caption: 'For Bigger Escapes'
        }
      ];
      
      const randomVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
      
      const videoData = {
        userId: currentUser.uid,
        username: userProfile?.username || 'user',
        caption: randomVideo.caption,
        videoUrl: randomVideo.url,
        userAvatar: userProfile?.photoURL || null,
        song: 'Original Sound',
        hashtags: ['sample', 'debug'],
        status: 'active',
        isPrivate: false,
        views: 0,
        likes: [],
        comments: 0,
        shares: 0,
        saves: 0,
        isOriginalAudio: true,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'videos'), videoData);
      console.log('Added sample video with ID:', docRef.id);
      setSuccess(true);
      
      // Refresh the page after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error adding sample video:', error);
      alert('Failed to add sample video');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mb-6 p-4 bg-zinc-900 rounded-lg">
      <h3 className="font-medium text-white mb-3">Debug Tools</h3>
      
      <button
        onClick={handleAddSampleVideo}
        disabled={loading}
        className="py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white rounded-md disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Sample Video to Feed'}
      </button>
      
      {success && (
        <p className="mt-2 text-green-500">Video added! Refreshing...</p>
      )}
    </div>
  );
}
