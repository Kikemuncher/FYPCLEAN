'use client';

// src/app/profile/[username]/page.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getUserByUsername } from '@/lib/userService';
import { useAuth } from '@/context/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileVideos from '@/components/profile/ProfileVideos';
import SideNav from '@/components/layout/SideNav';

export default function ProfilePage() {
  const params = useParams();
  // Fix the TypeScript error by adding a null check
  const username = params?.username as string || '';
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchUserProfile() {
      if (!username) {
        setError('Username not provided');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const userData = await getUserByUsername(username);
        if (userData) {
          setUser(userData);
          setError('');
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
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
        <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
        <div className="mt-6">
          <ProfileVideos username={username} />
        </div>
      </div>
    </div>
  );
}
