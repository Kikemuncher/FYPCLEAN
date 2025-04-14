'use client';

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export default function ProfileSettingsPage() {
  const { userProfile, updateUserProfile, loading } = useAuth();
  const router = useRouter();
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [website, setWebsite] = useState('');
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Set initial values if userProfile exists
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setUsername(userProfile.username || '');
      setBio(userProfile.bio || '');
      setInstagram(userProfile.links?.instagram || '');
      setTwitter(userProfile.links?.twitter || '');
      setYoutube(userProfile.links?.youtube || '');
      setWebsite(userProfile.links?.website || '');
      setProfileImagePreview(userProfile.photoURL || '');
      setCoverImagePreview(userProfile.coverPhotoURL || '');
    }
  }, [userProfile]);
  
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };
  
  const uploadImage = async (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }
      
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Handle progress if needed
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    
    try {
      let photoURL = userProfile?.photoURL || '';
      let coverPhotoURL = userProfile?.coverPhotoURL || '';
      
      // Upload profile image if changed
      if (profileImage) {
        photoURL = await uploadImage(
          profileImage,
          `profiles/${userProfile?.uid}/profile.jpg`
        );
      }
      
      // Upload cover image if changed
      if (coverImage) {
        coverPhotoURL = await uploadImage(
          coverImage,
          `profiles/${userProfile?.uid}/cover.jpg`
        );
      }
      
      // Update user profile
      await updateUserProfile({
        displayName,
        username,
        bio,
        photoURL,
        coverPhotoURL,
        links: {
          instagram: instagram || undefined,
          twitter: twitter || undefined,
          youtube: youtube || undefined,
          website: website || undefined,
        }
      });
      
      setSuccess('Profile updated successfully');
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black ml-64"> {/* Add ml-64 to match sidenav width */}
        <div className="p-6 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Edit Profile</h1>
          
          <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-lg p-6 space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-500 p-3 rounded-md">
                <p className="text-red-400">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-900/30 border border-green-500 p-3 rounded-md">
                <p className="text-green-400">{success}</p>
              </div>
            )}
            
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800">
                  {profileImagePreview ? (
                    <img 
                      src={profileImagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <span>No image</span>
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                  <label 
                    htmlFor="profile-image"
                    className="py-2 px-4 border border-gray-700 rounded-md text-white hover:bg-zinc-800 cursor-pointer inline-block"
                  >
                    Change Photo
                  </label>
                </div>
              </div>
            </div>
            
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Cover Photo
              </label>
              <div className="aspect-[3/1] rounded-lg overflow-hidden bg-zinc-800 mb-3">
                {coverImagePreview ? (
                  <img 
                    src={coverImagePreview} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <span>No cover photo</span>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="cover-image"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
                <label 
                  htmlFor="cover-image"
                  className="py-2 px-4 border border-gray-700 rounded-md text-white hover:bg-zinc-800 cursor-pointer inline-block"
                >
                  Change Cover Photo
                </label>
              </div>
            </div>
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-400">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink"
                />
                <p className="mt-1 text-xs text-gray-500">This cannot be changed easily</p>
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
                />
              </div>
            </div>
            
            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-400">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink"
                rows={3}
                maxLength={160}
              />
              <p className="mt-1 text-xs text-gray-500">{bio.length}/160 characters</p>
            </div>
            
            {/* Social Links */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Social Links</h3>
              
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
            
            {/* Form Buttons */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="mr-3 py-2 px-4 border border-zinc-700 rounded-md shadow-sm text-white bg-transparent hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-tiktok-pink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tiktok-pink disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
