'use client';

import { useState } from 'react';
import { db, sampleVideos } from '@/lib/firebase';
import Link from 'next/link';

export default function MockDataPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const createMockData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      setMessage('Creating mock users...');
      
      // Create some mock users
      const mockUsers = [
        { displayName: 'Test User 1', email: 'test1@example.com', username: 'testuser1' },
        { displayName: 'Test User 2', email: 'test2@example.com', username: 'testuser2' },
      ];
      
      for (const user of mockUsers) {
        await db.addDoc({ path: 'users' }, {
          ...user,
          createdAt: new Date().toISOString(),
          followers: 0,
          following: 0
        });
      }
      
      setMessage(prev => prev + '\nCreating mock videos...');
      
      // Add sample videos to the mock DB
      for (const video of sampleVideos) {
        await db.addDoc({ path: 'videos' }, {
          ...video,
          userId: 'mock-user-1',
          createdAt: new Date().toISOString(),
          likes: Math.floor(Math.random() * 1000),
          comments: Math.floor(Math.random() * 100)
        });
      }
      
      setMessage(prev => prev + '\nMock data created successfully!');
    } catch (error) {
      setMessage(`Error creating mock data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Mock Data Generator</h1>
      
      <div className="mb-8 p-4 bg-zinc-900 rounded-lg max-w-lg">
        <p className="mb-4">
          This page creates mock data for testing the app without needing to connect to Firebase.
        </p>
        <button
          onClick={createMockData}
          disabled={loading}
          className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white px-4 py-2 rounded"
        >
          {loading ? 'Creating...' : 'Create Mock Data'}
        </button>
      </div>
      
      {message && (
        <div className="bg-zinc-900 p-4 rounded-lg mb-6 max-w-lg">
          <h2 className="font-bold mb-2">Result:</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-300">{message}</pre>
        </div>
      )}
      
      <div className="mt-6 bg-zinc-900 p-4 rounded-lg max-w-lg">
        <h2 className="text-xl font-bold mb-2">Sample Videos</h2>
        <div className="space-y-4">
          {sampleVideos.map(video => (
            <div key={video.id} className="p-3 bg-zinc-800 rounded">
              <p className="font-medium">{video.name}</p>
              <p className="text-sm text-gray-400">{video.caption}</p>
              <div className="mt-2">
                <video
                  src={video.url}
                  className="w-full h-auto rounded"
                  controls
                  muted
                  preload="metadata"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        <Link href="/" className="text-pink-500 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
