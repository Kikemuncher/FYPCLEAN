"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile } from '@/types/user';
import * as authService from '@/lib/authService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
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
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Subscribe to user profile document
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserProfile({ uid: doc.id, ...doc.data() } as UserProfile);
          } else {
            // If user document doesn't exist yet, create it
            setUserProfile(null);
          }
          setLoading(false);
        }, (err) => {
          console.error('Error getting user profile:', err);
          setLoading(false);
        });
        
        return () => unsubscribeUser();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
    
    return () => unsubscribeAuth();
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);

    try {
      await authService.registerUser(email, password, username);
      // Auth state listener will update the state
    } catch (err: any) {
      const errorMessage = err.message || 'Error during registration';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      await authService.signIn(email, password);
      // Auth state listener will update the state
    } catch (err: any) {
      const errorMessage = authService.getAuthErrorMessage(err.code) || err.message || 'Failed to sign in';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  // Sign out function
  const signOut = async () => {
    setError(null);

    try {
      await firebaseSignOut(auth);
      // Auth state listener will update the state
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
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Exclude properties that shouldn't be directly updated
      const { followers, following, uid, ...updateData } = data;
      
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      // If username is changed, update it in the usernames collection
      if (data.username && userProfile && data.username !== userProfile.username) {
        // Check if new username is available
        const newUsernameRef = doc(db, 'usernames', data.username.toLowerCase());
        const newUsernameDoc = await getDoc(newUsernameRef);
        
        if (newUsernameDoc.exists()) {
          throw new Error('Username already taken');
        }
        
        // Delete old username record
        if (userProfile.username) {
          const oldUsernameRef = doc(db, 'usernames', userProfile.username.toLowerCase());
          await updateDoc(oldUsernameRef, {
            uid: null,
            available: true
          });
        }
        
        // Reserve new username
        await updateDoc(newUsernameRef, {
          uid: currentUser.uid,
          username: data.username,
          createdAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  // Follow/unfollow functions
  const followUser = async (targetUid: string) => {
    if (!currentUser || !userProfile) return;

    try {
      // Update current user's following list
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        following: arrayUnion(targetUid),
        followingCount: increment(1),
        updatedAt: serverTimestamp()
      });
      
      // Update target user's followers list
      const targetUserRef = doc(db, 'users', targetUid);
      await updateDoc(targetUserRef, {
        followers: arrayUnion(currentUser.uid),
        followerCount: increment(1),
        updatedAt: serverTimestamp()
      });
      
      // Add a notification for the target user
      const notificationsRef = doc(db, 'notifications', `follow_${currentUser.uid}_${targetUid}`);
      await updateDoc(notificationsRef, {
        type: 'follow',
        fromUserId: currentUser.uid,
        fromUsername: userProfile.username,
        fromUserPhoto: userProfile.photoURL,
        toUserId: targetUid,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Follow user error:', err);
    }
  };

  const unfollowUser = async (targetUid: string) => {
    if (!currentUser) return;

    try {
      // Update current user's following list
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        following: arrayRemove(targetUid),
        followingCount: increment(-1),
        updatedAt: serverTimestamp()
      });
      
      // Update target user's followers list
      const targetUserRef = doc(db, 'users', targetUid);
      await updateDoc(targetUserRef, {
        followers: arrayRemove(currentUser.uid),
        followerCount: increment(-1),
        updatedAt: serverTimestamp()
      });
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
