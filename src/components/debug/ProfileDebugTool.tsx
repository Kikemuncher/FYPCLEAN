'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createTestVideoForUser } from '@/lib/userService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ProfileDebugTool() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const checkVideos = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const videosRef = collection(db, 'videos');
      const q = query(videosRef, where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      
      setResult(`Found ${snapshot.size} videos for this user.`);
      
      // Log details of each video
      snapshot.forEach((doc) => {
        console.log(`Video ID: ${doc.id}, Data:`, doc.data());
      });
    } catch (error) {
      console.error('Error checking videos:', error);
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestVideo = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const success = await createTestVideoForUser(currentUser.uid);
      setResult(success ? 'Test video created successfully!' : 'Failed to create test video');
    } catch (error) {
      console.error('Error creating test video:', error);
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-pink-600 text-white p-3 rounded-full shadow-lg"
      >
        🛠️
      </button>
      
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-zinc-900 border border-zinc-700 p-4 rounded-lg shadow-xl w-72">
          <h3 className="text-white font-medium mb-4">Profile Debug Tools</h3>
          
          <div className="space-y-3">
            <button
              onClick={checkVideos}
              disabled={loading}
              className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded"
            >
              Check Videos
            </button>
            
            <button
              onClick={createTestVideo}
              disabled={loading}
              className="w-full py-2 px-3 bg-pink-600 hover:bg-pink-700 text-white rounded"
            >
              Create Test Video
            </button>
          </div>
          
          {loading && (
            <div className="mt-3 text-center">
              <div className="inline-block animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
            </div>
          )}
          
          {result && (
            <div className="mt-3 p-2 bg-zinc-800 rounded text-sm">
              {result}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
