"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserProfile } from '@/types/user';
import * as localAuthService from '@/lib/localAuthService';
import { LocalUser } from '@/lib/localAuthService';

interface AuthContextType {
  currentUser: FirebaseUser | LocalUser | null;
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
  getFollowing: () => string[];
  getFollowers: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | LocalUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth state listener
  useEffect(() => {
    // For local auth, we will set the current user and profile immediately
    const loggedInUser = localAuthService.getLoggedInUser();
    if (loggedInUser) {
      setCurrentUser(loggedInUser);
      
      // Map LocalUser to UserProfile
      const userProfile: UserProfile = {
        uid: loggedInUser.uid,
        username: loggedInUser.username || loggedInUser.displayName || '',
        displayName: loggedInUser.displayName || '',
        bio: loggedInUser.bio || '',
        photoURL: loggedInUser.photoURL || '',
        coverPhotoURL: 'https://placehold.co/1200x400/gray/white?text=Cover',
        followerCount: loggedInUser.followerCount || 0,
        followingCount: loggedInUser.followingCount || 0,
        videoCount: loggedInUser.videoCount || 0,
        likeCount: loggedInUser.likeCount || 0,
        links: loggedInUser.links || {},
        createdAt: loggedInUser.createdAt,
        isVerified: false,
        isCreator: false,
        accountType: 'user',
        followers: loggedInUser.followers || [],
        following: loggedInUser.following || []
      };
      
      setUserProfile(userProfile);
    }
    setLoading(false);
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);

    try {
      // Check if username already exists first
      const usernameCheck = localAuthService.getUsers().find(u => u.username === username);
      if (usernameCheck) {
        throw new Error('Username already taken');
      }

      const user = await localAuthService.registerUser(email, password, username);

      // Create user profile in local storage (similar structure to Firestore)
      const userProfile: UserProfile = {
        uid: user.uid,
        username,
        displayName: username,
        bio: '',
        photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${username}&background=random`,
        coverPhotoURL: 'https://placehold.co/1200x400/gray/white?text=Cover',
        followerCount: 0,
        followingCount: 0,
        videoCount: 0,
        likeCount: 0,
        links: {},
        createdAt: Date.now(),
        isVerified: false,
        isCreator: false,
        accountType: 'user',
        followers: [],
        following: [],
      };

      setUserProfile(userProfile);
      setCurrentUser(user); // Set current user after successful signup
    } catch (err: any) {
      const errorMessage = err.message || 'Error during registration';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const user = await localAuthService.loginUser(email, password);
      
      // Explicit type conversion
      const userProfile: UserProfile = {
        uid: user.uid,
        username: user.username || '',
        displayName: user.displayName || '',
        bio: user.bio || '',
        photoURL: user.photoURL || '',
        coverPhotoURL: user.coverPhotoURL || 'https://placehold.co/1200x400/gray/white?text=Cover',
        followerCount: user.followerCount || 0,
        followingCount: user.followingCount || 0,
        videoCount: user.videoCount || 0,
        likeCount: user.likeCount || 0,
        links: user.links || {},
        createdAt: user.createdAt || Date.now(),
        isVerified: false,
        isCreator: false,
        accountType: 'user',
        followers: user.followers || [],
        following: user.following || []
      };

      setUserProfile(userProfile);
      setCurrentUser(user);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setError(null);

    try {
      localAuthService.logoutUser();
      setCurrentUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Failed to sign out');
      throw err;
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    setError(null);

    if (!currentUser) {
      setError('No user logged in');
      throw new Error('No user logged in');
    }

    try {
      // Await the user update
      const updatedUser = await localAuthService.updateUser(currentUser.uid, data);
      
      // Explicit type conversion to UserProfile
      const userProfile: UserProfile = {
        uid: updatedUser.uid,
        username: updatedUser.username || '',
        displayName: updatedUser.displayName || '',
        bio: updatedUser.bio || '',
        photoURL: updatedUser.photoURL || '',
        coverPhotoURL: updatedUser.coverPhotoURL || 'https://placehold.co/1200x400/gray/white?text=Cover',
        followerCount: updatedUser.followerCount || 0,
        followingCount: updatedUser.followingCount || 0,
        videoCount: updatedUser.videoCount || 0,
        likeCount: updatedUser.likeCount || 0,
        links: updatedUser.links || {},
        createdAt: updatedUser.createdAt || Date.now(),
        isVerified: false,
        isCreator: false,
        accountType: 'user',
        followers: updatedUser.followers || [],
        following: updatedUser.following || []
      };

      setUserProfile(userProfile);
      setCurrentUser(updatedUser);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  // Follow/unfollow functions
  const followUser = async (targetUid: string) => {
    if (!currentUser) return;

    try {
      const updatedUser = localAuthService.followUser(currentUser.uid, targetUid);
      setUserProfile(updatedUser);
      setCurrentUser(updatedUser);
    } catch (err) {
      console.error('Follow user error:', err);
    }
  };

  const unfollowUser = async (targetUid: string) => {
    if (!currentUser) return;

    try {
      const updatedUser = localAuthService.unfollowUser(currentUser.uid, targetUid);
      setUserProfile(updatedUser);
      setCurrentUser(updatedUser);
    } catch (err) {
      console.error('Unfollow user error:', err);
    }
  };

  // Check if following
  const isFollowing = (targetUid: string): boolean => {
    if (!userProfile || !userProfile.following) return false;
    return (userProfile.following as string[]).includes(targetUid);
  };

  // Get following list
  const getFollowing = (): string[] => {
    if (!userProfile || !userProfile.following) return [];
    return userProfile.following as string[];
  };

  // Get followers list
  const getFollowers = (): string[] => {
    if (!userProfile || !userProfile.followers) return [];
    return userProfile.followers as string[];
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowing,
    getFollowers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Add a function to translate Firebase error codes (not needed for local auth)
const translateFirebaseError = (errorCode: string): string => {
  return 'An error occurred during authentication';
};
