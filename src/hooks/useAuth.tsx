// src/hooks/useAuth.tsx
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserProfile } from '@/types/user';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Convert Firebase user to our User type
  const formatUser = (user: FirebaseUser): User => {
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: Date.now(),
      isVerified: false,
      isCreator: false,
      isAdmin: false,
    };
  };

  // Fetch user profile data
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userProfileRef = doc(db, 'userProfiles', uid);
      
      const userDoc = await getDoc(userDocRef);
      const profileDoc = await getDoc(userProfileRef);
      
      if (userDoc.exists()) {
        setCurrentUser(userDoc.data() as User);
      }
      
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, username: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Check if username is already taken
      const usernameDoc = await getDoc(doc(db, 'usernames', username));
      if (usernameDoc.exists()) {
        throw new Error('Username is already taken');
      }
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update display name
      await updateProfile(firebaseUser, {
        displayName: username
      });
      
      // Format user data
      const userData: User = {
        ...formatUser(firebaseUser),
        createdAt: Date.now()
      };
      
      // Create default profile
      const profileData: UserProfile = {
        uid: firebaseUser.uid,
        username: username,
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
        isCreator: false
      };
      
      // Save user data to Firestore
      const batch = db.batch();
      
      // Save user record
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      batch.set(userDocRef, userData);
      
      // Save profile record
      const profileDocRef = doc(db, 'userProfiles', firebaseUser.uid);
      batch.set(profileDocRef, profileData);
      
      // Reserve username
      const usernameDocRef = doc(db, 'usernames', username);
      batch.set(usernameDocRef, { uid: firebaseUser.uid });
      
      await batch.commit();
      
      // Update state
      setCurrentUser(userData);
      setUserProfile(profileData);
      
      // Redirect to create profile page
      router.push('/onboarding');
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Fetch user data
      await fetchUserProfile(firebaseUser.uid);
      
      // Redirect to home
      router.push('/');
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      router.push('/login');
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message || 'Failed to sign out');
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!currentUser) throw new Error('No user logged in');
      
      setError(null);
      setLoading(true);
      
      const profileRef = doc(db, 'userProfiles', currentUser.uid);
      await updateDoc(profileRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error: any) {
      console.error('Update profile error:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
