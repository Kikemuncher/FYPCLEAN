'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function SideNav() {
  const { currentUser, userProfile, loading, signOut } = useAuth();
  const router = useRouter();
  
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };
  
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 overflow-y-auto z-40">
      <div className="p-4">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-pink-600">Social App</span>
        </Link>
      </div>
      
      <div className="px-4 py-2">
        {/* Navigation links */}
        <nav className="space-y-2">
          <Link href="/" className="flex items-center p-2 hover:bg-zinc-800 rounded-md text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6-6h6" />
            </svg>
            <span>Home</span>
          </Link>
          
          <Link href="/discover" className="flex items-center p-2 hover:bg-zinc-800 rounded-md text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Discover</span>
          </Link>
          
          <Link href="/inbox" className="flex items-center p-2 hover:bg-zinc-800 rounded-md text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Inbox</span>
          </Link>
          
          {currentUser && (
            <Link href={`/profile/${userProfile?.username || currentUser.uid}`} className="flex items-center p-2 hover:bg-zinc-800 rounded-md text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </Link>
          )}
        </nav>
      </div>
      
      <div className="px-4 py-6 mt-6 border-t border-zinc-800">
        {loading ? (
          <div className="flex items-center p-2">
            <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse"></div>
            <div className="ml-3">
              <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse"></div>
            </div>
          </div>
        ) : currentUser ? (
          <div>
            <div className="flex items-center p-2">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src={userProfile?.photoURL || currentUser.photoURL || "https://placehold.co/100/gray/white?text=User"}
                  alt={userProfile?.displayName || currentUser.displayName || "User"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-3">
                <p className="text-white font-medium">
                  {userProfile?.displayName || currentUser.displayName}
                </p>
                <p className="text-gray-400 text-xs">
                  @{userProfile?.username || currentUser.displayName?.toLowerCase().replace(/\s+/g, '_')}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="mt-4 w-full py-2 px-4 flex justify-center items-center bg-zinc-800 hover:bg-zinc-700 rounded-md text-white text-sm font-medium transition-colors"
            >
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link 
              href="/auth/login" 
              className="block w-full py-2 px-4 text-center bg-zinc-800 hover:bg-zinc-700 rounded-md text-white text-sm font-medium transition-colors"
            >
              Log In
            </Link>
            <Link 
              href="/auth/signup" 
              className="block w-full py-2 px-4 text-center bg-pink-600 hover:bg-pink-700 rounded-md text-white text-sm font-medium transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
