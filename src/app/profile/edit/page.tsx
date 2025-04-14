'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile, getUserById } from '@/lib/userService';
import { uploadProfileImage } from '@/lib/storageService';

export default function EditProfilePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams?.get('newUser') === 'true';
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        router.push('/auth/signin');
        return;
      }
      
      try {
        const userData = await getUserById(currentUser.uid);
        
        if (userData) {
          setDisplayName(userData.displayName || '');
          setUsername(userData.username || '');
          setBio(userData.bio || '');
          
          if (userData.photoURL) {
            setImagePreview(userData.photoURL);
          }
        }
        
        setInitialDataLoaded(true);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [currentUser, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    
    setProfileImage(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError('');
      
      let photoURL = currentUser.photoURL || '';
      
      if (profileImage) {
        photoURL = await uploadProfileImage(currentUser.uid, profileImage);
      }
      
      await updateUserProfile(currentUser.uid, {
        displayName,
        username,
        bio,
        photoURL
      });
      
      if (isNewUser) {
        router.push('/');
      } else {
        router.push(`/profile/${username}`);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser && initialDataLoaded) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white ml-64 px-6 py-8"> {/* Add ml-64 to match sidenav width */}
      <div className="max-w-4xl mx-auto"> {/* Center content within the available space */}
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-zinc-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">
            {isNewUser ? 'Complete Your Profile' : 'Edit Profile'}
          </h1>
          <div className="w-8"></div> {/* Spacer for alignment */}
        </div>
        
        {error && (
          <div className="mb-8 bg-red-900/30 border border-red-700/50 p-4 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Profile Image */}
            <div className="p-6 md:border-r border-gray-800 flex flex-col items-center justify-start">
              <div className="relative mb-3">
                <div 
                  className="h-40 w-40 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center border-2 border-gray-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-20 w-20 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  )}
                </div>
                
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-black border border-gray-700 text-white flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              
              <p className="text-sm text-gray-400 text-center mt-4">
                Click on the image to upload a profile picture
              </p>
            </div>
            
            {/* Right Column - Form Fields */}
            <div className="p-6 col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-white"
                    required
                    placeholder="Your unique username"
                  />
                </div>
                
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-white"
                    placeholder="Your name to display"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={150}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-white"
                  placeholder="Tell others about yourself..."
                />
                <p className="text-xs text-gray-500 text-right mt-1">{bio.length}/150</p>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 bg-transparent hover:bg-gray-800 border border-gray-700 rounded-lg mr-3 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2 bg-white hover:bg-gray-100 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
