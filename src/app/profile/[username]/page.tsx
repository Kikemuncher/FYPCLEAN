// src/app/(main)/profile/[username]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getUserProfileByUsername } from '@/lib/userService';
import { UserProfile } from '@/types/user';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'videos' | 'likes' | 'favorites'>('videos');
  const { username } = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) return;
      
      setLoading(true);
      try {
        const profileData = await getUserProfileByUsername(username as string);
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [username]);
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  // Profile not found
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-white mb-4">User Not Found</h1>
        <p className="text-gray-400 mb-8">The user you're looking for doesn't exist.</p>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-tiktok-pink text-white rounded-md hover:bg-pink-700"
        >
          Go Home
        </button>
      </div>
    );
  }
  
  const isCurrentUser = currentUser && currentUser.uid === profile.uid;
  
  return (
    <div className="min-h-screen bg-black">
      {/* Cover photo */}
      <div className="relative h-36 w-full bg-zinc-800">
        {profile.coverPhotoURL && (
          <Image 
            src={profile.coverPhotoURL} 
            alt={`${profile.displayName}'s cover`}
            fill
            className="object-cover"
          />
        )}
      </div>
      
      {/* Profile info */}
      <div className="relative px-4 pb-4 -mt-14">
        <div className="flex items-end">
          <div className="relative h-24 w-24 rounded-full border-4 border-black overflow-hidden bg-zinc-800">
            <Image 
              src={profile.photoURL || "https://placehold.co/200/gray/white?text=User"} 
              alt={profile.displayName} 
              fill
              className="object-cover"
            />
          </div>
          
          <div className="ml-4 flex-1">
            <h1 className="text-xl font-bold text-white flex items-center">
              @{profile.username}
              {profile.isVerified && (
                <span className="ml-1 text-tiktok-blue">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </h1>
            <p className="text-white">{profile.displayName}</p>
          </div>
          
          <div>
            {isCurrentUser ? (
              <button 
                onClick={() => router.push('/settings')}
                className="px-4 py-1.5 bg-transparent border border-zinc-700 text-white rounded-md hover:bg-zinc-800"
              >
                Edit Profile
              </button>
            ) : (
              <button className="px-4 py-1.5 bg-tiktok-pink text-white rounded-md hover:bg-pink-700">
                Follow
              </button>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex mt-4 space-x-4">
          <div className="text-center">
            <p className="font-bold text-white">{profile.followingCount}</p>
            <p className="text-gray-400 text-sm">Following</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-white">{profile.followerCount}</p>
            <p className="text-gray-400 text-sm">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-white">{profile.likeCount}</p>
            <p className="text-gray-400 text-sm">Likes</p>
          </div>
        </div>
        
        {/* Bio */}
        {profile.bio && (
          <p className="text-white mt-4">
            {profile.bio}
          </p>
        )}
        
        {/* Social links */}
        {profile.links && Object.keys(profile.links).length > 0 && (
          <div className="flex mt-2 space-x-2">
            {profile.links.instagram && (
              <a 
                href={`https://instagram.com/${profile.links.instagram}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
            
            {profile.links.twitter && (
              <a 
                href={`https://twitter.com/${profile.links.twitter}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
            )}
            
            {profile.links.youtube && (
              <a 
                href={`https://youtube.com/${profile.links.youtube}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}
            
            {profile.links.website && (
              <a 
                href={profile.links.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="border-t border-zinc-800 mt-4">
        <div className="flex">
          <button 
            className={`flex-1 py-3 text-center font-medium ${activeTab === 'videos' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </button>
          <button 
            className={`flex-1 py-3 text-center font-medium ${activeTab === 'likes' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('likes')}
          >
            Likes
          </button>
          <button 
            className={`flex-1 py-3 text-center font-medium ${activeTab === 'favorites' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites
          </button>
        </div>
      </div>
      
      {/* Content based on active tab */}
      <div className="p-4">
        {activeTab === 'videos' && (
          <div className="grid grid-cols-3 gap-1">
            {/* Replace with actual video grid when implemented */}
            <div className="aspect-[9/16] bg-zinc-800 rounded-md flex items-center justify-center">
              <p className="text-white text-xs">No videos yet</p>
            </div>
          </div>
        )}
        
        {activeTab === 'likes' && (
          <div className="flex flex-col items-center justify-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-white font-bold text-lg">No liked videos yet</p>
            <p className="text-gray-400 text-center mt-2">
              Videos liked by {isCurrentUser ? 'you' : profile.username} will appear here
            </p>
          </div>
        )}
        
        {activeTab === 'favorites' && (
          <div className="flex flex-col items-center justify-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-white font-bold text-lg">No favorite videos yet</p>
            <p className="text-gray-400 text-center mt-2">
              Videos marked as favorites by {isCurrentUser ? 'you' : profile.username} will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
