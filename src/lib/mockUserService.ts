// src/lib/mockUserService.ts
import { UserProfile, User } from '@/types/user';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const getUserProfileByUsername = async (usernameOrUid: string): Promise<UserProfile | null> => {
  if (!isBrowser) return null;
  
  // Check current user in mock auth
  const currentUserStr = localStorage.getItem('mock-auth-user');
  const currentProfileStr = localStorage.getItem('mock-auth-profile');
  
  if (currentUserStr && currentProfileStr) {
    const currentUser = JSON.parse(currentUserStr) as User;
    const currentProfile = JSON.parse(currentProfileStr) as UserProfile;
    
    if (
      currentProfile.username === usernameOrUid || 
      currentUser.uid === usernameOrUid
    ) {
      return currentProfile;
    }
  }
  
  // Check mock profiles
  const mockProfilesStr = localStorage.getItem('mock-profiles');
  if (mockProfilesStr) {
    const mockProfiles = JSON.parse(mockProfilesStr) as UserProfile[];
    const foundProfile = mockProfiles.find(
      profile => profile.username === usernameOrUid || profile.uid === usernameOrUid
    );
    
    if (foundProfile) return foundProfile;
  }
  
  // Add a default test profile for demo purposes
  if (usernameOrUid === 'testuser' || usernameOrUid === 'mock-test-user') {
    return {
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
  }
  
  return null;
};
