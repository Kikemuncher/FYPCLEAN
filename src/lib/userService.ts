// src/lib/userService.ts
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  setDoc,
  increment,
  limit,
  orderBy,
  serverTimestamp,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { User, UserProfile, CreatorApplication, UserRelationship } from '@/types/user';

// Get a user by ID
export const getUserById = async (uid: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

// Get a user profile by ID
export const getUserProfileById = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'userProfiles', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile by ID:', error);
    return null;
  }
};

// Get a user profile by username
export const getUserProfileByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    // First get UID from username
    const usernameRef = doc(db, 'usernames', username);
    const usernameSnap = await getDoc(usernameRef);
    
    if (!usernameSnap.exists()) {
      return null;
    }
    
    const uid = usernameSnap.data().uid;
    
    // Now get the profile
    return await getUserProfileById(uid);
  } catch (error) {
    console.error('Error getting user profile by username:', error);
    return null;
  }
};

// Update a user profile
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<boolean> => {
  try {
    const profileRef = doc(db, 'userProfiles', uid);
    
    await updateDoc(profileRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

// Check if a username is available
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  try {
    const usernameRef = doc(db, 'usernames', username);
    const usernameSnap = await getDoc(usernameRef);
    
    return !usernameSnap.exists();
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};

// Follow a user
export const followUser = async (currentUserUid: string, targetUserUid: string): Promise<boolean> => {
  try {
    if (currentUserUid === targetUserUid) {
      console.error('Cannot follow yourself');
      return false;
    }
    
    // Create relationship document
    const relationshipId = `${currentUserUid}_${targetUserUid}`;
    const relationshipRef = doc(db, 'relationships', relationshipId);
    
    // Check if already following
    const relationshipSnap = await getDoc(relationshipRef);
    if (relationshipSnap.exists()) {
      console.error('Already following this user');
      return false;
    }
    
    // Create relationship
    const relationship: UserRelationship = {
      followerId: currentUserUid,
      followingId: targetUserUid,
      createdAt: Date.now()
    };
    
    await setDoc(relationshipRef, relationship);
    
    // Update follower count for target user
    const targetProfileRef = doc(db, 'userProfiles', targetUserUid);
    await updateDoc(targetProfileRef, {
      followerCount: increment(1)
    });
    
    // Update following count for current user
    const currentProfileRef = doc(db, 'userProfiles', currentUserUid);
    await updateDoc(currentProfileRef, {
      followingCount: increment(1)
    });
    
    return true;
  } catch (error) {
    console.error('Error following user:', error);
    return false;
  }
};

// Unfollow a user
export const unfollowUser = async (currentUserUid: string, targetUserUid: string): Promise<boolean> => {
  try {
    // Delete relationship document
    const relationshipId = `${currentUserUid}_${targetUserUid}`;
    const relationshipRef = doc(db, 'relationships', relationshipId);
    
    // Check if relationship exists
    const relationshipSnap = await getDoc(relationshipRef);
    if (!relationshipSnap.exists()) {
      console.error('Not following this user');
      return false;
    }
    
    await deleteDoc(relationshipRef);
    
    // Update follower count for target user
    const targetProfileRef = doc(db, 'userProfiles', targetUserUid);
    await updateDoc(targetProfileRef, {
      followerCount: increment(-1)
    });
    
    // Update following count for current user
    const currentProfileRef = doc(db, 'userProfiles', currentUserUid);
    await updateDoc(currentProfileRef, {
      followingCount: increment(-1)
    });
    
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }
};

// Check if user is following another user
export const isFollowing = async (currentUserUid: string, targetUserUid: string): Promise<boolean> => {
  try {
    const relationshipId = `${currentUserUid}_${targetUserUid}`;
    const relationshipRef = doc(db, 'relationships', relationshipId);
    const relationshipSnap = await getDoc(relationshipRef);
    
    return relationshipSnap.exists();
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};

// Get followers for a user
export const getFollowers = async (uid: string, pageSize = 10): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(db, 'relationships'),
      where('followingId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    const querySnapshot = await getDocs(q);
    const followerIds = querySnapshot.docs.map(doc => doc.data().followerId);
    
    // Get profiles for all followers
    const followers = await Promise.all(
      followerIds.map(id => getUserProfileById(id))
    );
    
    return followers.filter(profile => profile !== null) as UserProfile[];
  } catch (error) {
    console.error('Error getting followers:', error);
    return [];
  }
};

// Get users that a user is following
export const getFollowing = async (uid: string, pageSize = 10): Promise<UserProfile[]> => {
  try {
    const q = query(
      collection(db, 'relationships'),
      where('followerId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    const querySnapshot = await getDocs(q);
    const followingIds = querySnapshot.docs.map(doc => doc.data().followingId);
    
    // Get profiles for all following
    const following = await Promise.all(
      followingIds.map(id => getUserProfileById(id))
    );
    
    return following.filter(profile => profile !== null) as UserProfile[];
  } catch (error) {
    console.error('Error getting following:', error);
    return [];
  }
};

// Submit creator application
export const submitCreatorApplication = async (application: Omit<CreatorApplication, 'status' | 'submittedAt'>): Promise<boolean> => {
  try {
    const appRef = doc(db, 'creatorApplications', application.uid);
    
    // Check if already applied
    const appSnap = await getDoc(appRef);
    if (appSnap.exists()) {
      console.error('Application already submitted');
      return false;
    }
    
    // Create application
    const creatorApp: CreatorApplication = {
      ...application,
      status: 'pending',
      submittedAt: Date.now()
    };
    
    await setDoc(appRef, creatorApp);
    return true;
  } catch (error) {
    console.error('Error submitting creator application:', error);
    return false;
  }
};

// Get creator application for a user
export const getCreatorApplication = async (uid: string): Promise<CreatorApplication | null> => {
  try {
    const appRef = doc(db, 'creatorApplications', uid);
    const appSnap = await getDoc(appRef);
    
    if (appSnap.exists()) {
      return appSnap.data() as CreatorApplication;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting creator application:', error);
    return null;
  }
};

// Get all pending creator applications (for admin)
export const getPendingCreatorApplications = async (): Promise<CreatorApplication[]> => {
  try {
    const q = query(
      collection(db, 'creatorApplications'),
      where('status', '==', 'pending'),
      orderBy('submittedAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as CreatorApplication);
  } catch (error) {
    console.error('Error getting pending applications:', error);
    return [];
  }
};

// Approve or reject a creator application (for admin)
export const processCreatorApplication = async (
  applicationUid: string, 
  approved: boolean, 
  adminUid: string,
  rejectionReason?: string
): Promise<boolean> => {
  try {
    const appRef = doc(db, 'creatorApplications', applicationUid);
    
    // Update application status
    await updateDoc(appRef, {
      status: approved ? 'approved' : 'rejected',
      reviewedAt: Date.now(),
      reviewedBy: adminUid,
      rejectionReason: approved ? null : (rejectionReason || 'Application rejected')
    });
    
    if (approved) {
      // Update user and profile to make them a creator
      const userRef = doc(db, 'users', applicationUid);
      await updateDoc(userRef, {
        isCreator: true
      });
      
      const profileRef = doc(db, 'userProfiles', applicationUid);
      await updateDoc(profileRef, {
        isCreator: true
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error processing creator application:', error);
    return false;
  }
};

// Search for users by username or display name
export const searchUsers = async (query: string, limit = 10): Promise<UserProfile[]> => {
  try {
    if (!query || query.length < 2) return [];
    
    // Firebase doesn't support case-insensitive queries directly
    // So we're using a simple contains query for now
    // In a production app, you'd want to implement a more sophisticated approach
    const q = query.toLowerCase();
    
    const userProfilesRef = collection(db, 'userProfiles');
    const querySnapshot = await getDocs(userProfilesRef);
    
    const matchingProfiles = querySnapshot.docs
      .map(doc => doc.data() as UserProfile)
      .filter(profile => 
        profile.username.toLowerCase().includes(q) || 
        profile.displayName.toLowerCase().includes(q)
      )
      .slice(0, limit);
    
    return matchingProfiles;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};
