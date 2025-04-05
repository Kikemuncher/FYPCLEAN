"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserProfile } from '@/types/user';

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
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && isMounted) {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else if (isMounted) {
        setUserProfile(null);
      }

      if (isMounted) {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);

    try {
      // Check if username already exists first
      const usernameCheck = await getDocs(
        query(collection(db, 'users'), where('username', '==', username))
      );
      if (!usernameCheck.empty) {
        throw new Error('Username already taken');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with username
      await updateProfile(user, {
        displayName: username,
        photoURL: `https://ui-avatars.com/api/?name=${username}&background=random`,
      });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        username,
        displayName: username,
        bio: '',
        photoURL: `https://ui-avatars.com/api/?name=${username}&background=random`,
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

      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        email: user.email,
      });

      setUserProfile(userProfile);
    } catch (err: any) {
      const errorMessage = err.code ? translateFirebaseError(err.code) : err.message;
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
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const errorMessage = err.code ? translateFirebaseError(err.code) : err.message;
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
      await firebaseSignOut(auth);
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
      await updateDoc(userRef, {
        ...data,
        updatedAt: Date.now(),
      });

      if (userProfile) {
        setUserProfile({
          ...userProfile,
          ...data,
        });
      }

      // Update Firebase Auth profile if necessary
      if (data.displayName || data.photoURL) {
        await updateProfile(currentUser, {
          displayName: data.displayName || currentUser.displayName,
          photoURL: data.photoURL || currentUser.photoURL,
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
    if (!currentUser) return;

    try {
      // Update current user's following list
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        following: arrayUnion(targetUid),
        followingCount: (userProfile?.followingCount || 0) + 1,
      });

      // Update target user's followers list
      const targetRef = doc(db, 'users', targetUid);
      await updateDoc(targetRef, {
        followers: arrayUnion(currentUser.uid),
        followerCount: increment(1),
      });

      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          following: [...(userProfile.following || []), targetUid],
          followingCount: (userProfile.followingCount || 0) + 1,
        });
      }
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
        followingCount: Math.max(0, (userProfile?.followingCount || 0) - 1),
      });

      // Update target user's followers list
      const targetRef = doc(db, 'users', targetUid);
      await updateDoc(targetRef, {
        followers: arrayRemove(currentUser.uid),
        followerCount: increment(-1),
      });

      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          following: (userProfile.following || []).filter((uid) => uid !== targetUid),
          followingCount: Math.max(0, (userProfile.followingCount || 0) - 1),
        });
      }
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

// Add a function to translate Firebase error codes
const translateFirebaseError = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Email is already in use';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/weak-password':
      return 'Password is too weak';
    // Add more error cases as needed
    default:
      return 'An error occurred during authentication';
  }
};
