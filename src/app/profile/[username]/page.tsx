'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getUserByUsername } from '@/lib/userService';
import { useAuth } from '@/hooks/useAuth';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileVideos from '@/components/profile/ProfileVideos';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const { username } = router.query as { username: string };
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, followUser, unfollowUser, isFollowing } = useAuth();

  useEffect(() => {
    async function fetchUserProfile() {
      if (!username) return;
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-tiktok-pink rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.uid === user?.uid;
  const following = isFollowing(user?.uid);

  return (
    <div className="container mx-auto px-4 pt-16">
      <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
      <ProfileVideos username={username} />

      {/* Additional elements from previous version can be incorporated here as needed */}
    </div>
  );
}
