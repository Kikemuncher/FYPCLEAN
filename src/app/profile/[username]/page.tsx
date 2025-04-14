'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserProfileByUsername } from '@/lib/userService';
import { getVideosByUsername } from '@/lib/videoService';
import { VideoData } from '@/types/video';
import { UserProfile } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [activeTab, setActiveTab] = useState('videos');
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 18;

  const isOwnProfile = currentUser?.uid === profile?.uid;

  useEffect(() => {
    const loadProfileData = async () => {
      if (!username) return;

      try {
        setLoading(true);
        setError('');

        const userProfile = await getUserProfileByUsername(username);

        if (!userProfile) {
          setError('User not found');
          setLoading(false);
          return;
        }

        setProfile(userProfile);

        const userVideos = await getVideosByUsername(username, 0, pageSize);
        setVideos(userVideos);
        setHasMore(userVideos.length === pageSize);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [username]);

  const loadMoreVideos = async () => {
    if (loadingMore || !hasMore || !username) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const offset = page * pageSize;

      const moreVideos = await getVideosByUsername(username, offset, pageSize);

      if (moreVideos.length > 0) {
        setVideos((prevVideos) => [...prevVideos, ...moreVideos]);
        setPage(nextPage);
        setHasMore(moreVideos.length === pageSize);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="ml-64 max-w-4xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center h-[70vh]">
            <div className="flex space-x-2 animate-pulse">
              <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
              <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
              <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">{error}</h1>
            <p className="text-gray-400 mb-6">The profile you're looking for doesn't exist or is unavailable.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors"
            >
              Return Home
            </button>
          </div>
        )}

        {!loading && !error && profile && (
          <>
            {/* Profile Header - Modern Design */}
            <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Profile Image */}
                <div className="relative">
                  <div className="h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden bg-zinc-800 ring-4 ring-teal-500/20">
                    {profile?.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt={profile.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700">
                        <span className="text-5xl font-bold text-white">
                          {profile?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold">{profile?.displayName || profile?.username}</h1>
                  <h2 className="text-teal-400 mb-4 flex items-center justify-center md:justify-start gap-1">
                    <span>@{profile?.username}</span>
                    {/* Verified badge if applicable */}
                    {profile?.verified && (
                      <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </h2>

                  <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-6">
                    <div className="text-center">
                      <span className="text-2xl font-bold">{profile?.videoCount || videos.length}</span>
                      <p className="text-gray-400 text-sm">Videos</p>
                    </div>

                    <div className="text-center">
                      <span className="text-2xl font-bold">{profile?.followersCount || 0}</span>
                      <p className="text-gray-400 text-sm">Followers</p>
                    </div>

                    <div className="text-center">
                      <span className="text-2xl font-bold">{profile?.followingCount || 0}</span>
                      <p className="text-gray-400 text-sm">Following</p>
                    </div>
                  </div>

                  {profile?.bio && (
                    <p className="text-gray-300 max-w-md mb-6">{profile.bio}</p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    {isOwnProfile ? (
                      <Link
                        href="/profile/edit"
                        className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg flex items-center gap-2 transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Profile
                      </Link>
                    ) : (
                      <button className="px-8 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-all">
                        Follow
                      </button>
                    )}
                    
                    <button className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs - Redesigned */}
            <div className="border-b border-zinc-800 mb-8">
              <nav className="flex">
                <button
                  className={`px-6 py-4 text-sm font-medium relative ${
                    activeTab === 'videos'
                      ? 'text-teal-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('videos')}
                >
                  Videos
                  {activeTab === 'videos' && (
                    <span className="absolute bottom-0 left-0 h-0.5 bg-teal-400 w-full"></span>
                  )}
                </button>
                <button
                  className={`px-6 py-4 text-sm font-medium relative ${
                    activeTab === 'liked'
                      ? 'text-teal-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('liked')}
                >
                  Liked
                  {activeTab === 'liked' && (
                    <span className="absolute bottom-0 left-0 h-0.5 bg-teal-400 w-full"></span>
                  )}
                </button>
              </nav>
            </div>

            {/* Video Grid - Redesigned */}
            {videos.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {videos.map((video) => (
                    <Link 
                      href={`/?video=${video.id}`}
                      key={video.id} 
                      className="group block aspect-[9/16] rounded-xl overflow-hidden bg-zinc-900 relative"
                    >
                      {/* Video Thumbnail */}
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.caption || 'Video thumbnail'}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <video
                          src={video.videoUrl}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          muted
                          playsInline
                          onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                          onMouseOut={(e) => {
                            const video = e.target as HTMLVideoElement;
                            video.pause();
                            video.currentTime = 0;
                          }}
                        />
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <p className="text-sm font-medium line-clamp-2 text-white">{video.caption}</p>
                        
                        <div className="flex items-center mt-2">
                          <div className="flex items-center text-xs text-white space-x-2">
                            <div className="flex items-center">
                              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {video.views || 0}
                            </div>
                            
                            <div className="flex items-center">
                              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {video.likes || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Load More Button - Redesigned */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMoreVideos}
                      disabled={loadingMore}
                      className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                    >
                      {loadingMore ? (
                        <>
                          <svg className="animate-spin mr-2 h-4 w-4 text-teal-400" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Loading videos</span>
                        </>
                      ) : (
                        'Show more videos'
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl py-14 px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No videos yet</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  {isOwnProfile
                    ? 'Share your first video with the world!'
                    : "This user hasn't uploaded any videos yet."}
                </p>

                {isOwnProfile && (
                  <Link
                    href="/upload"
                    className="mt-6 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 rounded-lg inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Upload a Video
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
