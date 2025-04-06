// src/lib/authService.ts
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '@/types/user';

// Handle error translation
export const getAuthErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing the operation';
    case 'auth/requires-recent-login':
      return 'Please sign in again to complete this action';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful login attempts. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
};

// Register new user
export const registerUser = async (email: string, password: string, username: string): Promise<User> => {
  try {
    // First check if username is already taken by querying Firestore
    const usernameCheckSnapshot = await getDoc(doc(db, 'usernames', username.toLowerCase()));
    if (usernameCheckSnapshot.exists()) {
      throw new Error('Username already taken');
    }

    // Create the user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile with display name
    await updateProfile(user, {
      displayName: username
    });
    
    // Create user profile document in Firestore
    const userProfileData = {
      uid: user.uid,
      username: username,
      displayName: username,
      email: user.email || email,  // We're storing email in Firestore even if not in the type
      bio: '',
      photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${username}&background=random`,
      coverPhotoURL: 'https://placehold.co/1200x400/gray/white?text=Cover',
      followerCount: 0,
      followingCount: 0,
      videoCount: 0,
      likeCount: 0,
      links: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isVerified: false,
      isCreator: false,
      accountType: 'user',
      followers: [],
      following: []
    };
    
    await setDoc(doc(db, 'users', user.uid), {
      ...userProfileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Reserve the username to prevent duplicates
    await setDoc(doc(db, 'usernames', username.toLowerCase()), {
      uid: user.uid,
      username: username,
      createdAt: serverTimestamp()
    });
    
    return user;
  } catch (error: any) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Sign in existing user
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Subscribe to auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { 
        uid: userDoc.id, 
        ...userDoc.data() as Omit<UserProfile, 'uid'>
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    // This would typically use Firebase's sendPasswordResetEmail
    // But for now we'll just log it
    console.log(`Password reset would be sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset:', error);
    throw error;
  }
};
