"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import Image from 'next/image';

export default function Onboarding() {
  const { userProfile, updateUserProfile, loading, error } = useAuth();
  const router = useRouter();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Set initial values if userProfile exists
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setBio(userProfile.bio || '');
      setInstagram(userProfile.links?.instagram || '');
      setTwitter(userProfile.links?.twitter || '');
      setYoutube(userProfile.links?.youtube || '');
      setWebsite(userProfile.links?.website || '');
    }
  }, [userProfile]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateUserProfile({
        displayName,
        bio,
        links: {
          instagram: instagram || undefined,
          twitter: twitter || undefined,
          youtube: youtube || undefined,
          website: website || undefined
        }
      });
      
      // Redirect to home after successful update
      router.push('/');
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AuthWrapper requireAuth={true}>
      {loading || !userProfile ? (
        <div className="flex min-h-screen bg-black">
          <div className="m-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen bg-black">
          <div className="m-auto w-full max-w-lg p-6 bg-zinc-900 rounded-lg shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
              <p className="text-gray-400 mt-1">Tell the world about yourself</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture (we'll implement this feature later) */}
              <div className="flex justify-center mb-2">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-zinc-800">
                  <Image 
                    src={userProfile.photoURL || "https://placehold.co/400/gray/white?text=User"} 
                    alt="Profile" 
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-white text-xs">Change</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-400">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink"
                  placeholder="Your Name"
                  maxLength={30}
                />
                <p className="mt-1 text-xs text-gray-500">How your name will appear publicly</p>
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-400">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink"
                  placeholder="Tell everyone about yourself"
                  rows={3}
                  maxLength={80}
                />
                <p className="mt-1 text-xs text-gray-500">{bio.length}/80 characters</p>
              </div>
              
              <div className="border-t border-zinc-800 pt-4">
                <h3 className="text-lg font-medium text-white mb-2">Social Links</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-400">
                      Instagram
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-700 bg-zinc-800 text-gray-400">
                        instagram.com/
                      </span>
                      <input
                        type="text"
                        id="instagram"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="flex-1 block w-full px-3 py-2 rounded-none rounded-r-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink"
                        placeholder="username"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-400">
                      Twitter
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-700 bg-zinc-800 text-gray-400">
                        twitter.com/
                      </span>
                      <input
                        type="text"
                        id="twitter"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        className="flex-1 block w-full px-3 py-2 rounded-none rounded-r-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink"
                        placeholder="username"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="youtube" className="block text-sm font-medium text-gray-400">
                      YouTube
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-700 bg-zinc-800 text-gray-400">
                        youtube.com/
                      </span>
                      <input
                        type="text"
                        id="youtube"
                        value={youtube}
                        onChange={(e) => setYoutube(e.target.value)}
                        className="flex-1 block w-full px-3 py-2 rounded-none rounded-r-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink"
                        placeholder="c/channel"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-400">
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm mt-2">
                  {error}
                </div>
              )}
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="py-2 px-4 border border-zinc-700 rounded-md shadow-sm text-white bg-transparent hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-700"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-tiktok-pink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tiktok-pink disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthWrapper>
  );
}
