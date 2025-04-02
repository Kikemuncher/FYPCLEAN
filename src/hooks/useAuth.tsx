// Replace the current useMockAuthState function with this version

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserProfile } from '@/types/user';
import * as localStorageService from '@/lib/localStorageService';

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
    } catch (err) {
      console.error('Follow user error:', err);
    }
  };

  const unfollowUser = async (targetUid: string) => {
    if (!mounted || !currentUser) return;
    
    try {
      localStorageService.unfollowUser(currentUser.uid, targetUid);
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

  // Other methods would remain the same
  // Include savePost, unsavePost, isPostSaved, upgradeToCreator, etc.

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
    savePost: async () => {}, // Implement these as needed
    unsavePost: async () => {},
    isPostSaved: () => false,
    getFollowing,
    getFollowers,
    upgradeToCreator: async () => {}
  };
};
