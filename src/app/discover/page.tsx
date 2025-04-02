// src/app/(main)/discover/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useAuth } from '@/hooks/useAuth';

export default function DiscoverPage() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-black py-4 px-4">
      <div className="max-w-[500px] mx-auto">
        <h1 className="text-xl font-bold text-white mb-4">Discover</h1>
        
        <div className="bg-zinc-900 rounded-xl p-4 mb-4">
          <h2 className="text-white font-semibold mb-2">Search</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for users, videos, or sounds"
              className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg py-2 px-4 pr-10 focus:outline-none focus:border-tiktok-pink"
            />
            <svg 
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-white font-semibold mb-3">Popular Hashtags</h2>
          <div className="flex flex-wrap gap-2">
            {['#fyp', '#viral', '#dance', '#comedy', '#music', '#trending'].map((tag) => (
              <div key={tag} className="bg-zinc-800 rounded-full px-3 py-1.5">
                <span className="text-white text-sm">{tag}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-white font-semibold mb-3">Suggested Accounts</h2>
          <div className="space-y-4">
            {['user1', 'user2', 'user3'].map((user) => (
              <div key={user} className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0"></div>
                <div className="ml-3">
                  <p className="text-white font-medium">@{user}</p>
                  <p className="text-gray-400 text-sm">Popular Creator</p>
                </div>
                <button className="ml-auto text-tiktok-pink text-sm font-medium">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
