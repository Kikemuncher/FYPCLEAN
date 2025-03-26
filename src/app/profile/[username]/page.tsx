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
  const { currentUser, userProfile } = useAuth();

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) return;

      setLoading(true);
      try {
        const usernameStr = Array.isArray(username) ? username[0] : username;

        // First check if this is the current user by comparing with auth state
        if (currentUser && (currentUser.uid === usernameStr || currentUser.displayName === usernameStr)) {
          if (userProfile) {
            setProfile(userProfile);
            setLoading(false);
            return;
          }
        }

        const profileData = await getUserProfileByUsername(usernameStr as string);

        if (profileData) {
          setProfile(profileData);
        } else {
          console.error('Profile not found for username:', usernameStr);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username, currentUser, userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black">
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
      </div>
    );
  }

  const isCurrentUser = currentUser && currentUser.uid === profile.uid;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-zinc-800">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center">
          <button 
            onClick={() => router.back()}
            className="text-white p-2 -ml-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg ml-4">{`@${profile.username}`}</h1>
        </div>
      </div>

      <div className="pt-14">
        {/* Cover Photo */}
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

        {/* Profile Info */}
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
            <p className="text-white mt-4">{profile.bio}</p>
          )}
        </div>

        {/* Add more sections here like video tabs, content, etc. */}
      </div>
    </div>
  );
}
