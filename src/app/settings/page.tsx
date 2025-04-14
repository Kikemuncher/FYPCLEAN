'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/userService';
import { UserProfile } from '@/types/user';
import { uploadProfileImage } from '@/lib/storageService';

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  
  useEffect(() => {
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userProfile = await getUserProfile(currentUser.uid);
        
        if (userProfile) {
          setProfile(userProfile);
          setDisplayName(userProfile.displayName || '');
          setBio(userProfile.bio || '');
          setWebsite(userProfile.website || '');
          
          if (userProfile.settings) {
            setEmailNotifications(userProfile.settings.emailNotifications || true);
            setPrivateAccount(userProfile.settings.privateAccount || false);
            setShowActivity(userProfile.settings.showActivity || true);
          }
          
          if (userProfile.photoURL) {
            setPreviewUrl(userProfile.photoURL);
          }
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
        setError("Couldn't load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser, router]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      
      let photoURL = profile?.photoURL || '';
      
      // Upload new profile image if one was selected
      if (profileImage) {
        photoURL = await uploadProfileImage(profileImage, currentUser.uid);
      }
      
      // Update profile data
      await updateUserProfile(currentUser.uid, {
        displayName,
        bio,
        website,
        photoURL,
        settings: {
          emailNotifications,
          privateAccount,
          showActivity
        }
      });
      
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex space-x-2 animate-pulse">
          <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
          <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
          <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Navigation */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-8">
              <h1 className="text-2xl font-bold mb-6">Settings</h1>
              
              <nav className="flex flex-col gap-1 mb-8">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    activeTab === 'profile' ? 'bg-teal-500/10 text-teal-400' : 'hover:bg-zinc-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('account')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    activeTab === 'account' ? 'bg-teal-500/10 text-teal-400' : 'hover:bg-zinc-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-6V7m0 0a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  <span>Account</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('privacy')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    activeTab === 'privacy' ? 'bg-teal-500/10 text-teal-400' : 'hover:bg-zinc-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Privacy & Safety</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    activeTab === 'notifications' ? 'bg-teal-500/10 text-teal-400' : 'hover:bg-zinc-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span>Notifications</span>
                </button>
              </nav>
              
              <div className="mt-8 pt-6 border-t border-zinc-800">
                <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Goysly</span>
                </Link>
              </div>
            </div>
          </aside>
          
          {/* Main Content Area */}
          <div className="flex-1">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}
            
            {successMessage && (
              <div className="mb-6 p-4 bg-teal-500/10 border border-teal-500/50 rounded-lg">
                <p className="text-teal-400">{successMessage}</p>
              </div>
            )}
            
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>
                
                <form onSubmit={handleSaveProfile}>
                  <div className="mb-6">
                    <label className="block mb-4 font-medium">Profile Photo</label>
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800">
                          {previewUrl ? (
                            <img 
                              src={previewUrl} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700">
                              <span className="text-2xl font-bold text-white">
                                {profile?.username?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <label htmlFor="profile-image" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </label>
                        
                        <input 
                          type="file"
                          id="profile-image" 
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Profile Photo</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Choose a photo to make your profile stand out
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-6 mb-6">
                    <div>
                      <label htmlFor="displayName" className="block mb-2 text-sm font-medium">
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-teal-500"
                        placeholder="Your display name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block mb-2 text-sm font-medium">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-teal-500 h-24"
                        placeholder="Tell others about yourself"
                        maxLength={150}
                      ></textarea>
                      <p className="text-xs text-gray-400 mt-1">
                        {bio.length}/150 characters
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="website" className="block mb-2 text-sm font-medium">
                        Website
                      </label>
                      <input
                        type="url"
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-teal-500"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                  
                  <div className="border-t border-zinc-800 pt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Saving</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Account Settings */}
            {activeTab === 'account' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                
                <div className="bg-zinc-900/60 backdrop-blur-md rounded-lg p-6 mb-6">
                  <h3 className="font-medium mb-4">Account Information</h3>
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                      <span className="text-gray-400">Email</span>
                      <span>{currentUser?.email}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                      <span className="text-gray-400">Username</span>
                      <span>@{profile?.username}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                      <span className="text-gray-400">Account created</span>
                      <span>{currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-zinc-900/60 backdrop-blur-md rounded-lg p-6 mb-6">
                  <h3 className="font-medium text-red-400 mb-4">Danger Zone</h3>
                  
                  <div className="space-y-4">
                    <button className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                      Change Password
                    </button>
                    
                    <button className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                      Deactivate Account
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Privacy & Safety</h2>
                
                <div className="bg-zinc-900/60 backdrop-blur-md rounded-lg p-6 mb-6">
                  <h3 className="font-medium mb-6">Privacy Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Private Account</h4>
                        <p className="text-sm text-gray-400 mt-1">Only approved followers can see your videos</p>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={privateAccount} 
                          onChange={(e) => setPrivateAccount(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Show Activity Status</h4>
                        <p className="text-sm text-gray-400 mt-1">Let others see when you're active</p>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={showActivity} 
                          onChange={(e) => setShowActivity(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-zinc-900/60 backdrop-blur-md rounded-lg p-6">
                  <h3 className="font-medium mb-6">Safety</h3>
                  
                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                      <span>Blocked Accounts</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    <button className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                      <span>Download Your Data</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
                
                <div className="bg-zinc-900/60 backdrop-blur-md rounded-lg p-6 mb-6">
                  <h3 className="font-medium mb-6">Push Notifications</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Like Notifications</h4>
                        <p className="text-sm text-gray-400 mt-1">When someone likes your videos</p>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Comment Notifications</h4>
                        <p className="text-sm text-gray-400 mt-1">When someone comments on your videos</p>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Follower Notifications</h4>
                        <p className="text-sm text-gray-400 mt-1">When someone follows you</p>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-zinc-900/60 backdrop-blur-md rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-400 mt-1">Receive updates via email</p>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={emailNotifications} 
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-teal-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </div>
                  
                  <div className="border-t border-zinc-800 pt-6">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Notification Settings'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
