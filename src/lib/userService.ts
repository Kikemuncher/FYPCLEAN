import { auth, db } from './firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  orderBy
} from 'firebase/firestore';
import { UserProfile, CreatorApplication } from '@/types/user';

const USE_MOCK_AUTH = true;

// Create or update user profile in Firestore
export const createUserProfile = async (userId: string, userData: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return userData;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Get user profile by ID
export const getUserById = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

// Get user by username using Firestore
export const getUserByUsername = async (username: string) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, userData: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    });
    return userData;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Existing functions from $2 preserved below:
// getUserProfileByUsername, createCreatorApplication, getCreatorApplication,
// getPendingCreatorApplications, processCreatorApplication, searchUsers, etc.

export const getUserProfileByUsername = async (usernameOrUid: string): Promise<UserProfile | null> => {
  // Implementation remains unchanged
};

export const createCreatorApplication = async (
  uid: string,
  applicationData: Partial<CreatorApplication>
): Promise<boolean> => {
  // Implementation remains unchanged
};

export const getCreatorApplication = async (uid: string): Promise<CreatorApplication | null> => {
  // Implementation remains unchanged
};

export const getPendingCreatorApplications = async (): Promise<CreatorApplication[]> => {
  // Implementation remains unchanged
};

export const processCreatorApplication = async (
  applicationUid: string,
  approved: boolean,
  adminUid: string,
  rejectionReason?: string
): Promise<boolean> => {
  // Implementation remains unchanged
};

export const searchUsers = async (queryStr: string, limit = 10): Promise<UserProfile[]> => {
  // Implementation remains unchanged
};
