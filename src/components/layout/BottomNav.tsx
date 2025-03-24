"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  HomeIcon, 
  PlusCircleIcon, 
  MagnifyingGlassIcon, 
  UserIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  UserIcon as UserIconSolid,
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid
} from '@heroicons/react/24/solid';

export default function BottomNav() {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  
  const isActive = (path: string): boolean => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-black pb-safe z-40">
      <div className="flex justify-around items-center max-w-lg mx-auto h-14">
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center justify-center">
            {isActive('/') ? (
              <HomeIconSolid className="h-6 w-6 text-white" />
            ) : (
              <HomeIcon className="h-6 w-6 text-gray-400" />
            )}
            <span className={`text-xs mt-1 ${isActive('/') ? 'text-white' : 'text-gray-400'}`}>
              Home
            </span>
          </div>
        </Link>
        
        <Link href="/discover" className="flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center justify-center">
            {isActive('/discover') ? (
              <MagnifyingGlassIconSolid className="h-6 w-6 text-white" />
            ) : (
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
            )}
            <span className={`text-xs mt-1 ${isActive('/discover') ? 'text-white' : 'text-gray-400'}`}>
              Discover
            </span>
          </div>
        </Link>
        
        <Link href={currentUser ? "/upload" : "/auth/login"} className="flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center justify-center">
            {isActive('/upload') ? (
              <PlusCircleIconSolid className="h-8 w-8 text-tiktok-pink" />
            ) : (
              <PlusCircleIcon className="h-8 w-8 text-tiktok-pink" />
            )}
          </div>
        </Link>
        
        <Link href="/inbox" className="flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center justify-center">
            {isActive('/inbox') ? (
              <ChatBubbleLeftIconSolid className="h-6 w-6 text-white" />
            ) : (
              <ChatBubbleLeftIcon className="h-6 w-6 text-gray-400" />
            )}
            <span className={`text-xs mt-1 ${isActive('/inbox') ? 'text-white' : 'text-gray-400'}`}>
              Inbox
            </span>
          </div>
        </Link>
        
        <Link 
          href={currentUser ? `/profile/${currentUser.uid}` : "/auth/login"} 
          className="flex flex-col items-center justify-center w-full h-full"
        >
          <div className="flex flex-col items-center justify-center">
            {isActive('/profile') ? (
              <UserIconSolid className="h-6 w-6 text-white" />
            ) : (
              <UserIcon className="h-6 w-6 text-gray-400" />
            )}
            <span className={`text-xs mt-1 ${isActive('/profile') ? 'text-white' : 'text-gray-400'}`}>
              Profile
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
