// src/lib/authService.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User
} from 'firebase/auth';
import { auth } from './firebase';

// Sign up new user
export const signUp = async (email: string, password: string, username: string): Promise<User> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with username
    await updateProfile(user, {
      displayName: username
    });
    
    return user;
  } catch (error: any) {
    console.error('Error during signup:', error);
    throw error;
  }
};

// Sign in existing user
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

// Sign out user
export const signOut = async (): Promise<void> => {
  return firebaseSignOut(auth);
};

// Get current authenticated user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: User | null) => void): () => void => {
  return onAuthStateChanged(auth, callback);
};

// Translate Firebase auth error codes to user-friendly messages
export const getAuthErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already in use.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// Enhance error handling for auth operations
export const handleAuthError = (error: any): string => {
  // More comprehensive error handling
  const errorCode = error?.code || '';
  
  if (errorCode.includes('auth/email-already-in-use')) {
    return 'This email is already associated with an account';
  } else if (errorCode.includes('auth/invalid-email')) {
    return 'Please enter a valid email address';
  } else if (errorCode.includes('auth/weak-password')) {
    return 'Password should be at least 6 characters';
  } else if (errorCode.includes('auth/user-not-found') || errorCode.includes('auth/wrong-password')) {
    return 'Invalid email or password';
  } else if (errorCode.includes('auth/too-many-requests')) {
    return 'Too many unsuccessful login attempts. Please try again later';
  } else if (errorCode.includes('auth/network-request-failed')) {
    return 'Network error. Please check your connection and try again';
  }
  
  // Log unknown errors for debugging
  console.error('Unhandled auth error:', error);
  return 'An unexpected error occurred. Please try again';
};

// Add more robust session persistence
export const initializeAuthStateListener = (callback: (user: User | null) => void): () => void => {
  // Use local persistence for better user experience
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error('Error setting persistence:', error);
    });
  
  return onAuthStateChanged(auth, callback);
};

// Add password reset functionality
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send email verification after signup
export const sendVerificationEmail = async (user: User): Promise<void> => {
  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Update user email (requires recent login)
export const updateUserEmail = async (user: User, newEmail: string): Promise<void> => {
  try {
    await updateEmail(user, newEmail);
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
};

// Update user password (requires recent login)
export const updateUserPassword = async (user: User, newPassword: string): Promise<void> => {
  try {
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Re-authenticate user (needed for sensitive operations)
export const reauthenticateUser = async (user: User, email: string, password: string): Promise<void> => {
  try {
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
  } catch (error) {
    console.error('Error reauthenticating user:', error);
    throw error;
  }
}
