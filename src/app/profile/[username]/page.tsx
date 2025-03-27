// Imports
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
  const [following, setFollowing] = useState(false);

  const { username } = useParams();
  const router = useRouter();
  const { currentUser, userProfile, followUser, unfollowUser, isFollowing } = useAuth();

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) return;
      setLoading(true);
      try {
        const usernameStr = Array.isArray(username) ? username[0] : username;

        if (currentUser && (currentUser.uid === usernameStr || currentUser.displayName === usernameStr)) {
          if (userProfile) {
            setProfile(userProfile);
            return;
          }
        }

        const profileData = await getUserProfileByUsername(usernameStr);
        if (profileData) {
          setProfile(profileData);
        } else {
          console.error('Profile not found for username:', usernameStr);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username, currentUser, userProfile]);

  // Sync follow state
  useEffect(() => {
    if (profile && currentUser) {
      setFollowing(isFollowing(profile.uid));
    }
  }, [profile, currentUser, isFollowing]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-white mb-4">User Not Found</h1>
      <p className="text-gray-400 mb-6">This user profile does not exist.</p>
      <button 
        onClick={() => router.push('/')}
        className="px-4 py-2 bg-tiktok-pink text-white rounded-md"
      >
        Go Home
      </button>
    </div>
  );

  const isCurrentUser = currentUser && currentUser.uid === profile.uid;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-zinc-800">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center">
          <button onClick={() => router.back()} className="text-white p-2 -ml-2">
            ←
          </button>
          <h1 className="text-white font-bold text-lg ml-4">@{profile.username}</h1>
        </div>
      </div>

      {/* Cover & Info */}
      <div className="pt-14">
        <div className="relative h-36 w-full bg-zinc-800">
          {profile.coverPhotoURL && (
            <Image 
              src={profile.coverPhotoURL} 
              alt="Cover"
              fill
              className="object-cover"
            />
          )}
        </div>

        <div className="relative px-4 pb-4 -mt-14">
          <div className="flex items-end">
            <div className="relative h-24 w-24 rounded-full border-4 border-black overflow-hidden bg-zinc-800">
              <Image 
                src={profile.photoURL || "https://placehold.co/200"} 
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>

            <div className="ml-4 flex-1">
              <h1 className="text-xl font-bold text-white flex items-center">
                @{profile.username}
                {profile.isVerified && (
                  <span className="ml-1 text-tiktok-blue">✔️</span>
                )}
              </h1>
              <p className="text-white">{profile.displayName}</p>
            </div>

            <div>
              {isCurrentUser ? (
                <button 
                  onClick={() => router.push('/settings')}
                  className="px-4 py-1.5 border border-zinc-600 text-white rounded-md hover:bg-zinc-800"
                >
                  Edit Profile
                </button>
              ) : (
                <button 
                  onClick={async () => {
                    if (following) {
                      await unfollowUser(profile.uid);
                    } else {
                      await followUser(profile.uid);
                    }
                    setFollowing(!following);
                  }}
                  className="px-4 py-1.5 bg-tiktok-pink text-white rounded-md hover:bg-pink-700"
                >
                  {following ? 'Unfollow' : 'Follow'}
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
      </div>
    </div>
  );
}
