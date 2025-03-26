"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SideNav() {
  const pathname = usePathname();
  const { currentUser, userProfile } = useAuth();
  
  const isActive = (path: string): boolean => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-8">
      <Link href="/" className="flex flex-col items-center group">
        <div className={`rounded-full p-3 transition-colors ${isActive('/') ? 'bg-black/70' : 'bg-black/50 group-hover:bg-black/60'}`}>
          <svg className={`h-8 w-8 ${isActive('/') ? 'text-white' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10-10 4.486-10 10-10-10 4.486-10-10zm-3 17v-10l9 5-9 5z"/>
          </svg>
        </div>
        <span className={`text-sm font-medium mt-2 ${isActive('/') ? 'text-white' : 'text-gray-300'}`}>For You</span>
      </Link>

      <Link href="/discover" className="flex flex-col items-center group">
        <div className={`rounded-full p-3 transition-colors ${isActive('/discover') ? 'bg-black/70' : 'bg-black/50 group-hover:bg-black/60'}`}>
          <svg className={`h-8 w-8 ${isActive('/discover') ? 'text-white' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <span className={`text-sm font-medium mt-2 ${isActive('/discover') ? 'text-white' : 'text-gray-300'}`}>Discover</span>
      </Link>

      <Link href={currentUser ? "/upload" : "/auth/login"} className="flex flex-col items-center group">
        <div className="rounded-full bg-tiktok-pink p-3 group-hover:bg-pink-600 transition-colors">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <span className="text-sm font-medium mt-2 text-white">Upload</span>
      </Link>

      <Link href="/inbox" className="flex flex-col items-center group">
        <div className={`rounded-full p-3 transition-colors ${isActive('/inbox') ? 'bg-black/70' : 'bg-black/50 group-hover:bg-black/60'}`}>
          <svg className={`h-8 w-8 ${isActive('/inbox') ? 'text-white' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <span className={`text-sm font-medium mt-2 ${isActive('/inbox') ? 'text-white' : 'text-gray-300'}`}>Inbox</span>
      </Link>

      <Link 
        href={currentUser ? 
          (userProfile?.username ? `/profile/${userProfile.username}` : `/profile/${currentUser.uid}`) : 
          "/auth/login"} 
        className="flex flex-col items-center group"
      >
        <div className={`rounded-full p-3 transition-colors ${isActive('/profile') ? 'bg-black/70' : 'bg-black/50 group-hover:bg-black/60'}`}>
          <svg className={`h-8 w-8 ${isActive('/profile') ? 'text-white' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <span className={`text-sm font-medium mt-2 ${isActive('/profile') ? 'text-white' : 'text-gray-300'}`}>Profile</span>
      </Link>
    </div>
  );
}
