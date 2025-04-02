'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SideNav from '@/components/layout/SideNav';
import Link from 'next/link';

export const dynamic = "force-dynamic";
export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string || '';
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, userProfile, getFollowing, isFollowing, followUser, unfollowUser } = useAuth();

  useEffect(() => {
    async function fetchUserProfile() {
      if (!username) {
        setError('Username not provided');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // For testing, create a mock user profile
        const mockUser = {
          uid: `user-${username}`,
          username: username,
          displayName: username.charAt(0).toUpperCase() + username.slice(1).replace(/_/g, ' '),
          bio: 'This is a mock profile for testing',
          photoURL: `https://randomuser.me/api/portraits/<span class="math-inline">\{Math\.random\(\) \> 0\.5 ? 'women' \: 'men'\}/</span>{Math.floor(Math.random() * 99)}.jpg`,
          coverPhotoURL: 'https://placehold.co/1200x400/gray/white?text=Cover',
          followerCount: 0,
          followingCount: 0,
          videoCount: 0,
          likeCount: 0,
          links: {
            instagram: username,
            twitter: username,
          },
          isVerified: Math.random() > 0.7,
          isCreator: true,
          accountType: 'creator'
        };
        
        setUser(mockUser);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <SideNav />
        <div className="ml-64 p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-40 bg-zinc-900 rounded-lg"></div>
            <div className="h-80 bg-zinc-900 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <SideNav />
        <div className="ml-64 p-6">
          <div className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && user && (currentUser.uid === user.uid || currentUser.email === user.email);

  return (
    <div className="min-h-screen bg-black">
      <SideNav />
      <div className="ml-64 p-6">
        {/* Profile Header */}
        <div className="p-6 bg-zinc-900 rounded-lg">
          <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden">
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.username}&size=128&background=random`}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-white">@{user.username}</h1>
              
              {user.displayName && (
                <p className="text-gray-400 text-lg">{user.displayName}</p>
              )}
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
                <div className="text-center">
                  <p className="text-white font-bold">{user.videoCount || 0}</p>
                  <p className="text-gray-400 text-sm">Videos</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold">{user.followerCount || 0}</p>
                  <p className="text-gray-400 text-sm">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold">{user.followingCount || 0}</p>
                  <p className="text-gray-400 text-sm">Following</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold">{user.likeCount || 0}</p>
                  <p className="text-gray-400 text-sm">Likes</p>
                </div>
              </div>
              
              {user.bio && (
                <p className="mt-4 text-white">{user.bio}</p>
              )}
              
              <div className="mt-6">
                {isOwnProfile ? (
                  <Link 
                    href="/settings/profile" 
                    className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-full text-sm font-medium text-white hover:bg-zinc-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </Link>
                ) : (
                  <button
                    className="inline-flex items-center px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none"
                  >
                    Follow
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Videos Section */}
        <div className="mt-6">
          <div className="border-b border-zinc-800 pb-4 mb-6">
            <h2 className="text-lg font-medium text-white">Videos</h2>
          </div>
          
          {/* Mock Videos Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-zinc-800 rounded-md overflow-hidden">
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-zinc-500">Video {i + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
