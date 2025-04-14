'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile } from '@/types/user';

// Define the AuthContext type
interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
}

// Create the context with a meaningful initial value
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  error: null,
  signUp: async () => { throw new Error('AuthProvider not initialized'); },
  signIn: async () => { throw new Error('AuthProvider not initialized'); },
  signOut: async () => { throw new Error('AuthProvider not initialized'); },
});

// Export the useAuth hook with proper error handling
export function useAuth() {
  const context = useContext(AuthContext);
  // Providing a more helpful error message
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider. Check if AuthProvider is missing in the component tree.');
    // Return a default value instead of throwing to prevent rendering errors
    return {
      currentUser: null,
      userProfile: null,
      loading: false,
      error: 'AuthContext is undefined. Check your component hierarchy.',
      signUp: async () => { throw new Error('AuthProvider not initialized'); },
      signIn: async () => { throw new Error('AuthProvider not initialized'); },
      signOut: async () => { throw new Error('AuthProvider not initialized'); },
    };
  }
  return context;
}

// Export the AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a basic user profile document if it doesn't exist
  const createUserProfileDocument = async (user: User, username?: string) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Create default profile data
      const userData = {
        uid: user.uid,
        username: username || user.displayName?.toLowerCase().replace(/\s+/g, '_') || `user_${user.uid.substring(0, 8)}`,
        displayName: user.displayName || username || 'User',
        email: user.email || '',
        bio: '',
        photoURL: user.photoURL || '',
        coverPhotoURL: '',
        followerCount: 0,
        followingCount: 0,
        videoCount: 0,
        likeCount: 0,
        links: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isVerified: false,
        isCreator: false,
        accountType: 'user'
      };
      
      await setDoc(userRef, userData, { merge: true });
      
      console.log('Created/updated user profile document');
      return userData;
    } catch (err) {
      console.error('Error creating user document:', err);
      throw err;
    }
  };

  // Listen to authentication state changes
  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      setCurrentUser(user);
      
      if (user) {
        // Check if user has a profile document
        try {
          const userDocRef = doc(db, 'users', user.uid);
          
          // Subscribe to user profile document with onSnapshot
          const unsubscribeSnapshot = onSnapshot(
            userDocRef,
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                console.log('User profile exists, updating state');
                const userData = docSnapshot.data();
                setUserProfile({ ...userData, uid: user.uid } as UserProfile);
              } else {
                console.log('User profile does not exist, creating new profile');
                // Create user profile if it doesn't exist
                createUserProfileDocument(user)
                  .then((userData) => {
                    setUserProfile(userData as unknown as UserProfile);
                  })
                  .catch((err) => {
                    console.error('Error creating profile:', err);
                    setError('Failed to create user profile');
                  });
              }
              setLoading(false);
            },
            (error) => {
              console.error('Error fetching user profile:', error);
              setError('Failed to fetch user profile');
              setLoading(false);
            }
          );
          
          return () => unsubscribeSnapshot();
        } catch (err) {
          console.error('Error in auth state change handler:', err);
          setLoading(false);
        }
      } else {
        // No user is signed in
        setUserProfile(null);
        setLoading(false);
      }
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, username: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Set the display name
      await updateProfile(user, {
        displayName: username
      });
      
      // Create user profile in Firestore
      await createUserProfileDocument(user, username);
      
      return user;
    } catch (err: any) {
      console.error('Sign up error:', err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err: any) {
      console.error('Sign in error:', err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (err: any) {
      console.error('Sign out error:', err.message);
      setError(err.message);
      throw err;
    }
  };

  // Create the context value object
  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
