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
  // Mock implementation
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
      
      // Always include test user in search results if it matches
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
  
  // Original Firebase implementation
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
