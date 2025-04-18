'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/types/user';

type ProfileHeaderProps = {
  user: UserProfile;
  isOwnProfile: boolean;
};

export default function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const { isFollowing, followUser, unfollowUser } = useAuth();
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  const handleFollow = async () => {
    if (!user?.uid) return;
    
    setIsFollowLoading(true);
    try {
      if (isFollowing(user.uid)) {
        await unfollowUser(user.uid);
      } else {
        await followUser(user.uid);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="animate-pulse p-6 bg-zinc-900 rounded-lg">
        <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-zinc-800"></div>
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-zinc-800 rounded w-48"></div>
            <div className="h-4 bg-zinc-800 rounded w-32"></div>
            <div className="flex gap-4">
              <div className="h-8 w-16 bg-zinc-800 rounded"></div>
              <div className="h-8 w-16 bg-zinc-800 rounded"></div>
              <div className="h-8 w-16 bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-zinc-900 rounded-lg">
      <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/10">
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
          
          {/* Stats Row */}
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

          {/* Bio */}
          {user.bio && (
            <p className="mt-4 text-white">{user.bio}</p>
          )}

          {/* Social Links */}
          {user.links && Object.keys(user.links).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {user.links.instagram && (
                <a
                  href={`https://instagram.com/${user.links.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              )}

              {user.links.twitter && (
                <a
                  href={`https://twitter.com/${user.links.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              )}

              {user.links.youtube && (
                <a
                  href={`https://youtube.com/${user.links.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  <span className="sr-only">YouTube</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                  </svg>
                </a>
              )}

              {user.links.website && (
                <a
                  href={user.links.website.startsWith('http') ? user.links.website : `https://${user.links.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  <span className="sr-only">Website</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
            </div>
          )}

          {/* Follow/Edit Button */}
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
                onClick={handleFollow}
                disabled={isFollowLoading}
                className={`inline-flex items-center px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white ${
                  isFollowing(user.uid) ? "bg-gray-600 hover:bg-gray-700" : "bg-tiktok-pink hover:bg-pink-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tiktok-pink disabled:opacity-50`}
              >
                {isFollowLoading ? 'Processing...' : isFollowing(user.uid) ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
