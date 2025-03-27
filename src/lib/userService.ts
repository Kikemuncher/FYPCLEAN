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

// Flag to use mock auth (same as in your useAuth.tsx)
const USE_MOCK_AUTH = true;

export const getUserProfileByUsername = async (usernameOrUid: string): Promise<UserProfile | null> => {
  // Mock mode
  if (USE_MOCK_AUTH) {
    // Test user shortcut
    if (usernameOrUid === "testuser" || usernameOrUid === "mock-test-user") {
      return {
        uid: "mock-test-user",
        username: "testuser",
        displayName: "Test User",
        bio: "This is a test user for development",
        photoURL: "https://placehold.co/400/gray/white?text=User",
        coverPhotoURL: "https://placehold.co/1200x400/gray/white?text=Cover",
        followerCount: 250,
        followingCount: 120,
        videoCount: 15,
        likeCount: 1800,
        links: {},
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        isVerified: true,
        isCreator: true
      };
    }

    // Generate mock if user not found
    if (usernameOrUid && !usernameOrUid.includes(' ')) {
      return {
        uid: `generated-${usernameOrUid}`,
        username: usernameOrUid,
        displayName: usernameOrUid,
        bio: `Creator of amazing content`,
        photoURL: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 99)}.jpg`,
        coverPhotoURL: "https://placehold.co/1200x400/gray/white?text=Cover",
        followerCount: Math.floor(Math.random() * 10000),
        followingCount: Math.floor(Math.random() * 500),
        videoCount: Math.floor(Math.random() * 50) + 1,
        likeCount: Math.floor(Math.random() * 100000),
        links: {},
        createdAt: Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
        isVerified: Math.random() > 0.7,
        isCreator: true
      };
    }
  }

  // Firebase fallback
  try {
    let userDoc;
    const usernameQuery = query(
      collection(db, 'usernames'),
      where('username', '==', usernameOrUid.toLowerCase())
    );
    const usernameSnapshot = await getDocs(usernameQuery);

    if (!usernameSnapshot.empty) {
      const uid = usernameSnapshot.docs[0].data().uid;
      userDoc = await getDoc(doc(db, 'userProfiles', uid));
    } else {
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

    await updateDoc(appRef, {
      status: approved ? 'approved' : 'rejected',
      reviewedAt: Date.now(),
      reviewedBy: adminUid,
      rejectionReason: approved ? null : (rejectionReason || 'Application rejected')
    });

    if (approved) {
      await updateDoc(doc(db, 'users', applicationUid), { isCreator: true });
      await updateDoc(doc(db, 'userProfiles', applicationUid), { isCreator: true });
    }

    return true;
  } catch (error) {
    console.error('Error processing creator application:', error);
    return false;
  }
};

export const searchUsers = async (queryStr: string, limit = 10): Promise<UserProfile[]> => {
  if (USE_MOCK_AUTH && typeof window !== 'undefined') {
    try {
      if (!queryStr || queryStr.length < 2) return [];

      const searchTerm = queryStr.toLowerCase();
      const profiles: UserProfile[] = [];

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

      const mockProfilesStr = localStorage.getItem('mock-profiles');
      if (mockProfilesStr) {
        const mockProfiles = JSON.parse(mockProfilesStr);
        mockProfiles.forEach((profile: UserProfile) => {
          if (
            profile.username.toLowerCase().includes(searchTerm) ||
            profile.displayName.toLowerCase().includes(searchTerm)
          ) {
            if (!profiles.some(p => p.uid === profile.uid)) {
              profiles.push(profile);
            }
          }
        });
      }

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

  try {
    if (!queryStr || queryStr.length < 2) return [];

    const q = queryStr.toLowerCase();
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
