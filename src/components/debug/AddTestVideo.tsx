'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';

export default function AddTestVideo() {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addTestVideo = async () => {
    if (!currentUser || !userProfile) {
      setError("You must be logged in");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Sample videos - using public domain videos
      const sampleVideos = [
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
      ];

      // Pick a random video from the samples
      const videoUrl = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
      
      // Add video document with complete metadata
      const videoData = {
        userId: currentUser.uid,
        username: userProfile.username,
        caption: `Test video ${new Date().toLocaleString()}`,
        videoUrl: videoUrl,
        thumbnailUrl: null,
        userAvatar: userProfile.photoURL || null,
        likes: [],
        comments: 0,
        shares: 0,
        views: 0,
        saves: 0,
        status: 'active',
        isPrivate: false,
        song: "Original Sound",
        hashtags: ["test", "demo"],
        createdAt: serverTimestamp()
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, "videos"), videoData);
      console.log(`Test video added with ID: ${docRef.id}`);

      // Update user's video count
      await updateDoc(doc(db, 'users', currentUser.uid), {
        videoCount: increment(1)
      });

      setSuccess(`Video added successfully! Refresh the page to see it.`);
      
      // Auto-refresh the page after 2 seconds to show the new video
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (e) {
      console.error("Error adding test video:", e);
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="bg-zinc-900 p-4 rounded-lg mb-6">
      <h3 className="text-white font-medium mb-4">Debug Tools</h3>
      
      <button
        onClick={addTestVideo}
        disabled={loading}
        className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Test Video (Auto-refresh)'}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-500 rounded-md">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-3 p-3 bg-green-900/30 border border-green-500 rounded-md">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}
    </div>
  );
}
