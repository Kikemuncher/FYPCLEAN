// src/hooks/useAuth.tsx
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
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  isPostLiked: (postId: string) => boolean;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
        setUserProfile(profile);
      } else {
        // If user data is incomplete, clear the current user
        localStorageService.setCurrentUser(null);
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
        followingCount: 0,
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
      setUserProfile(newProfile);
      
      router.push('/auth/onboarding');
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred');
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
        setError('User profile not found');
        setLoading(false);
        return;
      }
      
      // Set as current user
      localStorageService.setCurrentUser(user.uid);
      
      // Update state
      setCurrentUser(user);
      setUserProfile(profile);
      
      router.push('/');
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!mounted) return;
    
    try {
      localStorageService.setCurrentUser(null);
      setCurrentUser(null);
      setUserProfile(null);
      router.push('/auth/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!mounted || !currentUser || !userProfile) return;
    setLoading(true);
    setError(null);
    
    try {
      const updatedProfile = {
        ...userProfile,
        ...data,
        updatedAt: Date.now()
      };
      
      // Update local storage
      localStorageService.saveUserProfile(updatedProfile);
      
      // Update state
      setUserProfile(updatedProfile);
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (targetUid: string) => {
    if (!mounted || !currentUser) return;
    
    try {
      localStorageService.followUser(currentUser.uid, targetUid);
      // Update the local state if needed
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          followingCount: (userProfile.followingCount || 0) + 1
        });
      }
    } catch (err) {
      console.error('Follow user error:', err);
    }
  };

  const unfollowUser = async (targetUid: string) => {
    if (!mounted || !currentUser) return;
    
    try {
      localStorageService.unfollowUser(currentUser.uid, targetUid);
       // Update the local state if needed
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          followingCount: Math.max(0, (userProfile.followingCount || 0) - 1)
        });
      }
    } catch (err) {
      console.error('Unfollow user error:', err);
    }
  };

  const isFollowing = (targetUid: string): boolean => {
    if (!mounted || !currentUser) return false;
    return localStorageService.isFollowing(currentUser.uid, targetUid);
  };

  const likePost = async (postId: string) => {
    if (!mounted || !currentUser) return;
    
    try {
      localStorageService.likeVideo(currentUser.uid, postId);
    } catch (err) {
      console.error('Like post error:', err);
    }
  };

  const unlikePost = async (postId: string) => {
    if (!mounted || !currentUser) return;
    
    try {
      localStorageService.unlikeVideo(currentUser.uid, postId);
    } catch (err) {
      console.error('Unlike post error:', err);
    }
  };

  const isPostLiked = (postId: string): boolean => {
    if (!mounted || !currentUser) return false;
    return localStorageService.isVideoLiked(currentUser.uid, postId);
  };

  const savePost = async (postId: string) => {
    // Placeholder - implement if needed
    return Promise.resolve();
  };

  const unsavePost = async (postId: string) => {
    // Placeholder - implement if needed
    return Promise.resolve();
  };

  const isPostSaved = (postId: string): boolean => {
    // Placeholder - implement if needed
    return false;
  };

  const getFollowing = (): string[] => {
    if (!mounted || !currentUser) return [];
    
    const follows = localStorageService.getFollows();
    return follows
      .filter(f => f.followerId === currentUser.uid)
      .map(f => f.followingId);
  };

  const getFollowers = (): string[] => {
    if (!mounted || !currentUser) return [];
    
    const follows = localStorageService.getFollows();
    return follows
      .filter(f => f.followingId === currentUser.uid)
      .map(f => f.followerId);
  };

  const upgradeToCreator = async (creatorData: any) => {
    if (!mounted || !currentUser || !userProfile) return;
    
    try {
      const updatedUser = {
        ...currentUser,
        isCreator: true,
        accountType: 'creator' as const
      };
      
      const updatedProfile = {
        ...userProfile,
        ...creatorData,
        isCreator: true,
        accountType: 'creator' as const
      };
      
      // Update local storage
      localStorageService.saveUser(updatedUser);
      localStorageService.saveUserProfile(updatedProfile);
      
      // Update state
      setCurrentUser(updatedUser);
      setUserProfile(updatedProfile);
    } catch (err) {
      console.error('Upgrade to creator error:', err);
    }
  };

  return {
    currentUser,
    userProfile,
    loading: !mounted || loading,
    error,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    followUser,
    unfollowUser,
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
  const authContext = useMockAuthState();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null; // Return nothing during SSR to prevent hydration issues
  }
  
  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
