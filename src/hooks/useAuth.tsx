"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserProfile } from '@/types/user';
import * as localStorageService from '@/lib/localStorageService';

// Define the full AuthContextType with all required methods
interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  followUser: (targetUid: string) => Promise<void>;
  unfollowUser: (targetUid: string) => Promise<void>;
  isFollowing: (targetUid: string) => boolean;
  likePost: (postId: string) => Promise<void>; // Assuming posts are videos here based on localStorageService methods used
  unlikePost: (postId: string) => Promise<void>; // Assuming posts are videos here
  isPostLiked: (postId: string) => boolean; // Assuming posts are videos here
  savePost: (postId: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
  isPostSaved: (postId: string) => boolean;
  getFollowing: () => string[];
  getFollowers: () => string[];
  upgradeToCreator: (creatorData: any) => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Implementation of auth state with localStorage
const useMockAuthState = (): AuthContextType => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // State for profile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load current user on mount
  useEffect(() => {
    setMounted(true);
    
    const loadCurrentUser = () => {
      const currentUserId = localStorageService.getCurrentUserId();
      if (!currentUserId) {
        setCurrentUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }
      
      const user = localStorageService.getUserById(currentUserId);
      const profile = localStorageService.getUserProfileById(currentUserId);
      
      if (user && profile) {
        setCurrentUser(user);
        setUserProfile(profile); // Load profile into state
      } else {
        // If user data is incomplete, clear the current user
        localStorageService.setCurrentUser(null);
        setCurrentUser(null); // Also clear state
        setUserProfile(null); // Also clear state
      }
      
      setLoading(false);
    };
    
    loadCurrentUser();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    if (!mounted) return;
    setLoading(true);
    setError(null);
    
    try {
      // Check if email is already used
      const existingUser = localStorageService.getUserByEmail(email);
      if (existingUser) {
        setError('Email already in use');
        setLoading(false);
        return;
      }
      
      // Check if username is already taken
      const existingProfile = localStorageService.getUserProfileByUsername(username);
      if (existingProfile) {
        setError('Username already taken');
        setLoading(false);
        return;
      }
      
      // Create new user
      const uid = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const newUser: User = {
        uid,
        email,
        displayName: username,
        photoURL: null,
        createdAt: Date.now(),
        isVerified: false,
        isCreator: false,
        isAdmin: false,
        accountType: 'user'
      };
      
      const newProfile: UserProfile = {
        uid,
        username,
        displayName: username,
        bio: '',
        photoURL: 'https://placehold.co/400/gray/white?text=User',
        coverPhotoURL: 'https://placehold.co/1200x400/gray/white?text=Cover',
        followerCount: 0,
        followingCount: 0, // Initialize followingCount
        videoCount: 0,
        likeCount: 0,
        links: {},
        createdAt: Date.now(),
        isVerified: false,
        isCreator: false,
        accountType: 'user'
      };
      
      // Save to local storage
      localStorageService.saveUser(newUser);
      localStorageService.saveUserProfile(newProfile);
      localStorageService.setCurrentUser(uid);
      
      // Update state
      setCurrentUser(newUser);
      setUserProfile(newProfile); // Set profile state
      
      router.push('/auth/onboarding'); // Redirect after successful sign up
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!mounted) return;
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you'd verify the password
      // For this mock version, just check if the user exists
      const user = localStorageService.getUserByEmail(email);
      
      if (!user) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }
      
      const profile = localStorageService.getUserProfileById(user.uid);
      
      if (!profile) {
        // This case might indicate data inconsistency; handle appropriately
        setError('User profile not found. Please contact support.');
        // Optionally clear inconsistent state: localStorageService.setCurrentUser(null);
        setLoading(false);
        return;
      }
      
      // Set as current user
      localStorageService.setCurrentUser(user.uid);
      
      // Update state
      setCurrentUser(user);
      setUserProfile(profile); // Set profile state
      
      router.push('/'); // Redirect after successful sign in
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!mounted) return;
    
    try {
      localStorageService.setCurrentUser(null); // Clear current user marker
      setCurrentUser(null); // Clear state
      setUserProfile(null); // Clear profile state
      router.push('/auth/login'); // Redirect to login
    } catch (err) {
      console.error('Sign out error:', err);
      // Optionally set an error state if needed: setError('Failed to sign out');
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!mounted || !currentUser || !userProfile) return;
    // setLoading(true); // Optional: indicate loading state during profile update
    setError(null);
    
    try {
      const updatedProfile = {
        ...userProfile,
        ...data,
        updatedAt: Date.now() // Add/update timestamp if desired
      };
      
      // Update local storage
      localStorageService.saveUserProfile(updatedProfile);
      
      // Update state
      setUserProfile(updatedProfile);
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile');
    } finally {
      // setLoading(false); // Stop loading indicator
    }
  };

  // --- Updated followUser ---
  const followUser = async (targetUid: string): Promise<void> => {
    if (!mounted || !currentUser) return;
    
    try {
      // Attempt to update storage first
      const success = localStorageService.followUser(currentUser.uid, targetUid); 
      // Note: Assuming followUser returns boolean or throws on failure. Adapt if not.
      
      // If storage update was successful, update local state
      if (success && userProfile) { // Check if profile exists before updating
        setUserProfile({
          ...userProfile,
          followingCount: (userProfile.followingCount || 0) + 1
        });
      } else if (!success) {
         // Optional: Handle storage failure scenario if needed
         console.warn('Failed to persist follow action in storage.');
      }
    } catch (err) {
      console.error('Follow user error:', err);
      // Optionally set an error state: setError('Failed to follow user');
    }
  };

  // --- Updated unfollowUser ---
  const unfollowUser = async (targetUid: string): Promise<void> => {
    if (!mounted || !currentUser) return;
    
    try {
      // Attempt to update storage first
      const success = localStorageService.unfollowUser(currentUser.uid, targetUid);
      // Note: Assuming unfollowUser returns boolean or throws on failure. Adapt if not.

      // If storage update was successful, update local state
      if (success && userProfile) { // Check if profile exists before updating
        setUserProfile({
          ...userProfile,
          followingCount: Math.max(0, (userProfile.followingCount || 0) - 1)
        });
      } else if (!success) {
         // Optional: Handle storage failure scenario if needed
         console.warn('Failed to persist unfollow action in storage.');
      }
    } catch (err) {
      console.error('Unfollow user error:', err);
      // Optionally set an error state: setError('Failed to unfollow user');
    }
  };

  const isFollowing = (targetUid: string): boolean => {
    // Ensure checks happen only when ready and user exists
    if (!mounted || !currentUser) return false; 
    return localStorageService.isFollowing(currentUser.uid, targetUid);
  };

  // --- Assuming Posts = Videos based on localStorageService method names ---
  const likePost = async (postId: string) => { // Changed name to postId for consistency
    if (!mounted || !currentUser) return;
    
    try {
      // Assuming likeVideo returns boolean success or throws
      localStorageService.likeVideo(currentUser.uid, postId);
      // Potential improvement: Update local state for immediate feedback on like counts
    } catch (err) {
      console.error('Like post error:', err);
      // Optionally set an error state
    }
  };

  const unlikePost = async (postId: string) => { // Changed name to postId
    if (!mounted || !currentUser) return;
    
    try {
      // Assuming unlikeVideo returns boolean success or throws
      localStorageService.unlikeVideo(currentUser.uid, postId);
      // Potential improvement: Update local state for immediate feedback on like counts
    } catch (err) {
      console.error('Unlike post error:', err);
      // Optionally set an error state
    }
  };

  const isPostLiked = (postId: string): boolean => { // Changed name to postId
    if (!mounted || !currentUser) return false;
    // Assuming isVideoLiked exists and maps to post liking
    return localStorageService.isVideoLiked(currentUser.uid, postId); 
  };
  // --- End Post/Video Assumption ---


  const savePost = async (postId: string) => {
    // Placeholder - implement actual logic using localStorageService if needed
    console.warn('savePost not implemented');
    return Promise.resolve(); 
  };

  const unsavePost = async (postId: string) => {
    // Placeholder - implement actual logic using localStorageService if needed
    console.warn('unsavePost not implemented');
    return Promise.resolve();
  };

  const isPostSaved = (postId: string): boolean => {
    // Placeholder - implement actual logic using localStorageService if needed
    console.warn('isPostSaved not implemented');
    return false;
  };

  const getFollowing = (): string[] => {
    if (!mounted || !currentUser) return [];
    
    try {
      const follows = localStorageService.getFollows(); // Assumes getFollows exists
      return follows
        .filter(f => f.followerId === currentUser.uid)
        .map(f => f.followingId);
    } catch (err) {
      console.error('Error getting following list:', err);
      return []; // Return empty list on error
    }
  };

  const getFollowers = (): string[] => {
    if (!mounted || !currentUser) return [];
    
    try {
      const follows = localStorageService.getFollows(); // Assumes getFollows exists
      return follows
        .filter(f => f.followingId === currentUser.uid)
        .map(f => f.followerId);
    } catch (err) {
      console.error('Error getting followers list:', err);
      return []; // Return empty list on error
    }
  };

  const upgradeToCreator = async (creatorData: any) => { // Consider defining a type for creatorData
    if (!mounted || !currentUser || !userProfile) return;
    
    try {
      const updatedUser: User = { // Explicitly type
        ...currentUser,
        isCreator: true,
        accountType: 'creator' as const // Use const assertion for literal type
      };
      
      const updatedProfile: UserProfile = { // Explicitly type
        ...userProfile,
        ...creatorData, // Merge creator-specific data
        isCreator: true,
        accountType: 'creator' as const // Use const assertion
      };
      
      // Update local storage
      localStorageService.saveUser(updatedUser);
      localStorageService.saveUserProfile(updatedProfile);
      
      // Update state
      setCurrentUser(updatedUser);
      setUserProfile(updatedProfile);
    } catch (err) {
      console.error('Upgrade to creator error:', err);
      // Optionally set an error state
    }
  };

  return {
    currentUser,
    userProfile,
    // Ensure loading reflects mount status as well
    loading: !mounted || loading, 
    error,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    followUser, // Now using the updated version
    unfollowUser, // Now using the updated version
    isFollowing,
    likePost,
    unlikePost,
    isPostLiked,
    savePost,
    unsavePost,
    isPostSaved,
    getFollowing,
    getFollowers,
    upgradeToCreator
  };
};

// Provider component that wraps the app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const authContext = useMockAuthState(); // Use the hook that manages state
  
  // Prevent rendering children until mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // On the server or before hydration, return null or a loader
  if (!mounted) {
    return null; 
  }
  
  // Once mounted, provide the context value
  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) { // Check for undefined context
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
