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
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { UserProfile, CreatorApplication } from '@/types/user';

// Flag to use mock auth (same as in your useAuth.tsx)
const USE_MOCK_AUTH = true;

// Add the missing function that's being imported in profile/[username]/page.tsx
export const getUserProfileByUsername = async (usernameOrUid: string): Promise<UserProfile | null> => {
  try {
    // Check if this is a uid or username
    let userDoc;

    // First try to get by username
    const usernameQuery = query(
      collection(db, 'usernames'),
      where('username', '==', usernameOrUid.toLowerCase())
    );
    
    const usernameSnapshot = await getDocs(usernameQuery);
    
    if (!usernameSnapshot.empty) {
      // Get the uid from username document
      const uid = usernameSnapshot.docs[0].data().uid;
      userDoc = await getDoc(doc(db, 'userProfiles', uid));
    } else {
      // Try directly with the provided string as uid
      userDoc = await getDoc(doc(db, 'userProfiles', usernameOrUid));
    }
    
    if (userDoc && userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Add the rest of your user service functions here
export const createCreatorApplication = async (
  uid: string,
  applicationData: Partial<CreatorApplication>
): Promise<boolean> => {
  try {
    const appRef = doc(db, 'creatorApplications', uid);
    
    const creatorApp: CreatorApplication = {
      uid,
      username: applicationData.username || '',
      displayName: applicationData.displayName || '',
      email: applicationData.email || '',
      reason: applicationData.reason || '',
      socialLinks: applicationData.socialLinks || {},
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

// Rest of your functions...
// Add any other functions that might be imported elsewhere in your app

// You can see from the userService.ts fragment that it contained these functions:
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

// Add the search users function you had in the fragment
export const searchUsers = async (query: string, limit = 10): Promise<UserProfile[]> => {
  // Mock implementation for USE_MOCK_AUTH
  if (USE_MOCK_AUTH && typeof window !== 'undefined') {
    try {
      if (!query || query.length < 2) return [];
      
      const searchTerm = query.toLowerCase();
      const profiles: UserProfile[] = [];
      
      // Check current profile
      const currentProfileStr = localStorage.getItem('mock-auth-profile');
      if (currentProfileStr) {
        const currentProfile = JSON.parse(currentProfileStr);
        if (
          currentProfile.username.toLowerCase().includes(searchTerm) || 
          currentProfile.displayName.toLowerCase().includes(searchTerm)
        ) {
          profiles.push(currentProfile);
        }
      }
      
      // Check stored profiles
      const mockProfilesStr = localStorage.getItem('mock-profiles');
      if (mockProfilesStr) {
        const mockProfiles = JSON.parse(mockProfilesStr);
        mockProfiles.forEach((profile: UserProfile) => {
          if (
            profile.username.toLowerCase().includes(searchTerm) || 
            profile.displayName.toLowerCase().includes(searchTerm)
          ) {
            // Avoid duplicates
            if (!profiles.some(p => p.uid === profile.uid)) {
              profiles.push(profile);
            }
          }
        });
      }
      
      // Include test user in results if matches
      const testUser = {
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
      
      if (
        'testuser'.includes(searchTerm) || 
        'test user'.includes(searchTerm)
      ) {
        if (!profiles.some(p => p.uid === 'mock-test-user')) {
          profiles.push(testUser);
        }
      }
      
      return profiles.slice(0, limit);
    } catch (error) {
      console.error('Error in mock searchUsers:', error);
      return [];
    }
  }
  
  // Firebase implementation
  try {
    if (!query || query.length < 2) return [];
    
    // Firebase doesn't support case-insensitive queries directly
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
