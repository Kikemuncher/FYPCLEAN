'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SideNav() {
  const pathname = usePathname();
  const { currentUser, signOut } = useAuth();
  
  // Create a simple function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };
  
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 z-50">
      <div className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="p-5 border-b border-zinc-800">
          <Link href="/" className="text-xl font-bold text-white flex items-center">
            <span>TikTok Clone</span>
          </Link>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/') 
                    ? 'bg-pink-600 text-white' 
                    : 'text-gray-300 hover:bg-zinc-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>For You</span>
              </Link>
            </li>
            <li>
              <Link
                href="/following"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/following') 
                    ? 'bg-pink-600 text-white' 
                    : 'text-gray-300 hover:bg-zinc-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Following</span>
              </Link>
            </li>
            <li>
              <Link
                href="/discover"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/discover') 
                    ? 'bg-pink-600 text-white' 
                    : 'text-gray-300 hover:bg-zinc-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Discover</span>
              </Link>
            </li>
            <li>
              <Link
                href="/upload"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/upload') 
                    ? 'bg-pink-600 text-white' 
                    : 'text-gray-300 hover:bg-zinc-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Upload</span>
              </Link>
            </li>
            {currentUser && (
              <li>
                <Link
                  href={`/profile/${currentUser.uid}`}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    isActive('/profile') 
                      ? 'bg-pink-600 text-white' 
                      : 'text-gray-300 hover:bg-zinc-800'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        {/* User Section */}
        <div className="p-4 border-t border-zinc-800">
          {currentUser ? (
            <div>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700 mr-3">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span>{currentUser.displayName?.[0] || currentUser.email?.[0] || '?'}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm text-white">{currentUser.displayName || currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full text-sm py-2 px-3 bg-zinc-800 hover:bg-zinc-700 rounded-md text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link 
              href="/auth/signin"
              className="w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white rounded-md flex justify-center items-center transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
