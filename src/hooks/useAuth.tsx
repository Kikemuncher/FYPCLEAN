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
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserProfile } from '@/types/user';
import { useRouter } from 'next/navigation';

// Set this to true for offline/mock mode, false for real Firebase authentication
const USE_MOCK_AUTH = true;

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

// Mock authentication implementation
const useMockAuthState = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mock-auth-user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mock-auth-profile');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentUser) {
        localStorage.setItem('mock-auth-user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('mock-auth-user');
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (userProfile) {
        localStorage.setItem('mock-auth-profile', JSON.stringify(userProfile));
      } else {
        localStorage.removeItem('mock-auth-profile');
      }
    }
  }, [userProfile]);

  // Mock sign up
  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user
      const newUser: User = {
        uid: `mock-${Date.now()}`,
        email: email,
        displayName: username,
        photoURL: null,
        createdAt: Date.now(),
        isVerified: false,
        isCreator: false,
        isAdmin: false
      };
      
      // Create mock profile
      const newProfile: UserProfile = {
        uid: newUser.uid,
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
      
      setCurrentUser(newUser);
      setUserProfile(newProfile);
      
      // Redirect to onboarding
      router.push('/auth/onboarding');
    } catch (error: any) {
      setError('Failed to create account');
      console.error('Mock sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock sign in
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock credentials check (default test account)
      if (email === 'test@example.com' && password === 'password') {
        // Create mock user
        const testUser: User = {
          uid: 'mock-test-user',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: 'https://placehold.co/400/gray/white?text=User',
          createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
          isVerified: true,
          isCreator: true,
          isAdmin: false
        };
        
        // Create mock profile
        const testProfile: UserProfile = {
          uid: 'mock-test-user',
          username: 'testuser',
          displayName: 'Test User',
          bio: 'This is a test user for development',
          photoURL: 'https://placehold.co/400/gray/white?text=User',
          coverPhotoURL: 'https://placehold.co/1200x400/gray/white?text=Cover',
          followerCount: 250,
          followingCount: 120,
          videoCount: 15,
          likeCount: 1800,
          links: {
            instagram: 'testuser',
            twitter: 'testuser',
            youtube: 'testuser',
            website: 'https://example.com'
          },
          createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
          isVerified: true,
          isCreator: true
        };
        
        setCurrentUser(testUser);
        setUserProfile(testProfile);
        router.push('/');
      } else {
        // Check localStorage for any registered mock users
        const existingUsers = localStorage.getItem('mock-users');
        if (existingUsers) {
          const users = JSON.parse(existingUsers);
          const user = users.find((u: any) => u.email === email);
          
          if (user && user.password === password) {
            setCurrentUser(user);
            
            // Get matching profile
            const existingProfiles = localStorage.getItem('mock-profiles');
            if (existingProfiles) {
              const profiles = JSON.parse(existingProfiles);
              const profile = profiles.find((p: any) => p.uid === user.uid);
              if (profile) {
                setUserProfile(profile);
              }
            }
            
            router.push('/');
          } else {
            setError('Invalid email or password');
          }
        } else {
          setError('Invalid email or password');
        }
      }
    } catch (error: any) {
      setError('Failed to sign in');
      console.error('Mock sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock sign out
  const signOut = async () => {
    setLoading(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentUser(null);
      setUserProfile(null);
      router.push('/auth/login');
    } catch (error: any) {
      setError('Failed to sign out');
      console.error('Mock sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock update profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (!userProfile) {
        throw new Error('No user profile found');
      }
      
      // Update profile
      const updatedProfile = {
        ...userProfile,
        ...data,
        updatedAt: Date.now()
      };
      
      setUserProfile(updatedProfile);
      
      // Store in mock users array
      if (typeof window !== 'undefined') {
        const existingProfiles = localStorage.getItem('mock-profiles');
        if (existingProfiles) {
          const profiles = JSON.parse(existingProfiles);
          const profileIndex = profiles.findIndex((p: any) => p.uid === userProfile.uid);
          
          if (profileIndex >= 0) {
            profiles[profileIndex] = updatedProfile;
          } else {
            profiles.push(updatedProfile);
          }
          
          localStorage.setItem('mock-profiles', JSON.stringify(profiles));
        } else {
          localStorage.setItem('mock-profiles', JSON.stringify([updatedProfile]));
        }
      }
    } catch (error: any) {
      setError('Failed to update profile');
      console.error('Mock update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    currentUser,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateUserProfile
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Use mock authentication if flag is set
  if (USE_MOCK_AUTH) {
    const mockAuth = useMockAuthState();
    
    return (
      <AuthContext.Provider value={mockAuth}>
        {children}
      </AuthContext.Provider>
    );
  }

  // Real Firebase authentication starts here
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
      
      // Save user data to Firestore using batch
      const batch = writeBatch(db);
      
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
      router.push('/auth/onboarding');
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
      router.push('/auth/login');
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
