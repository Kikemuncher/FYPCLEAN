// src/lib/userService.ts
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
  // Implementation with proper return
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', usernameOrUid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as UserProfile;
    } else {
      // Also check by UID if username search fails
      const userDoc = await getDoc(doc(db, 'users', usernameOrUid));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as UserProfile;
      }
      return null;
    }
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null; // Return null in case of error
  }
};

export const createCreatorApplication = async (
  uid: string,
  applicationData: Partial<CreatorApplication>
): Promise<boolean> => {
  // Implement function body with return statement
  try {
    const applicationRef = doc(db, 'creatorApplications', uid);
    await setDoc(applicationRef, {
      ...applicationData,
      status: 'pending',
      submittedAt: Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error creating creator application:', error);
    return false;
  }
};

export const getCreatorApplication = async (uid: string): Promise<CreatorApplication | null> => {
  // Implement function body with return statement
  try {
    const applicationRef = doc(db, 'creatorApplications', uid);
    const applicationSnap = await getDoc(applicationRef);
    
    if (applicationSnap.exists()) {
      return { id: applicationSnap.id, ...applicationSnap.data() } as CreatorApplication;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting creator application:', error);
    return null;
  }
};

export const getPendingCreatorApplications = async (): Promise<CreatorApplication[]> => {
  // Implement function body with return statement
  try {
    const applicationsRef = collection(db, 'creatorApplications');
    const q = query(
      applicationsRef,
      where('status', '==', 'pending'),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CreatorApplication[];
  } catch (error) {
    console.error('Error getting pending creator applications:', error);
    return [];
  }
};

export const processCreatorApplication = async (
  applicationUid: string,
  approved: boolean,
  adminUid: string,
  rejectionReason?: string
): Promise<boolean> => {
  // Implement function body with return statement
  try {
    const applicationRef = doc(db, 'creatorApplications', applicationUid);
    const userRef = doc(db, 'users', applicationUid);
    
    // Update application status
    await updateDoc(applicationRef, {
      status: approved ? 'approved' : 'rejected',
      reviewedAt: Date.now(),
      reviewedBy: adminUid,
      rejectionReason: rejectionReason || null
    });
    
    // If approved, update user profile
    if (approved) {
      await updateDoc(userRef, {
        isCreator: true,
        accountType: 'creator',
        updatedAt: Date.now()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error processing creator application:', error);
    return false;
  }
};

export const searchUsers = async (queryStr: string, limit = 10): Promise<UserProfile[]> => {
  // Implement function body with return statement
  try {
    // Firebase doesn't support native text search, so we use startAt/endAt for prefix search
    const usersRef = collection(db, 'users');
    
    // Search by username
    const q = query(
      usersRef,
      where('username', '>=', queryStr),
      where('username', '<=', queryStr + '\uf8ff'),
      limit
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserProfile[];
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};
