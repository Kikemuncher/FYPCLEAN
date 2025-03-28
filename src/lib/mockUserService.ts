import { UserProfile, User } from "@/types/user";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Sample creator profiles that match our video sample data
const SAMPLE_CREATORS: UserProfile[] = [
  {
    uid: "creator-mixkit_user",
    username: "mixkit_user",
    displayName: "Holiday Creator",
    bio: "I create festive content for all seasons! 🎄✨",
    photoURL: "https://randomuser.me/api/portraits/women/44.jpg",
    coverPhotoURL: "https://placehold.co/1200x400/gray/white?text=Holiday+Creator",
    followerCount: 45600,
    followingCount: 120,
    videoCount: 15,
    likeCount: 187500,
    links: {
      instagram: "holidaycreator",
      twitter: "holidaycreator",
    },
    createdAt: Date.now() - 190 * 24 * 60 * 60 * 1000,
    isVerified: true,
    isCreator: true,
  },
  {
    uid: "creator-nature_lover",
    username: "nature_lover",
    displayName: "Nature Enthusiast",
    bio: "Exploring the outdoors and sharing the beauty of nature 🌲🏕️",
    photoURL: "https://randomuser.me/api/portraits/women/65.jpg",
    coverPhotoURL: "https://placehold.co/1200x400/228B22/white?text=Nature+Lover",
    followerCount: 34500,
    followingCount: 240,
    videoCount: 28,
    likeCount: 156700,
    links: {
      instagram: "naturelovers",
      twitter: "naturelover",
      youtube: "naturelover",
    },
    createdAt: Date.now() - 280 * 24 * 60 * 60 * 1000,
    isVerified: true,
    isCreator: true,
  },
  {
    uid: "creator-neon_vibes",
    username: "neon_vibes",
    displayName: "Neon Dreams",
    bio: "Bringing color to your life through neon aesthetics 💜💙💖",
    photoURL: "https://randomuser.me/api/portraits/women/22.jpg",
    coverPhotoURL: "https://placehold.co/1200x400/8A2BE2/white?text=Neon+Vibes",
    followerCount: 78900,
    followingCount: 350,
    videoCount: 42,
    likeCount: 890000,
    links: {
      instagram: "neonvibes",
      twitter: "neonvibes",
      website: "https://neonvibes.example.com",
    },
    createdAt: Date.now() - 360 * 24 * 60 * 60 * 1000,
    isVerified: true,
    isCreator: true,
  },
  {
    uid: "creator-user1",
    username: "user1",
    displayName: "User One",
    bio: "Sample creator bio",
    photoURL: "https://randomuser.me/api/portraits/women/85.jpg",
    coverPhotoURL: "https://placehold.co/1200x400/gray/white?text=Cover",
    followerCount: 25000,
    followingCount: 120,
    videoCount: 15,
    likeCount: 87000,
    links: {},
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    isVerified: true,
    isCreator: true,
  }
];

// Updated getUserProfileByUsername
export const getUserProfileByUsername = async (usernameOrUid: string): Promise<UserProfile | null> => {
  if (!isBrowser) return null;

  // First, check if this is one of our sample creators
  const sampleCreator = SAMPLE_CREATORS.find(
    creator => creator.username === usernameOrUid || creator.uid === usernameOrUid
  );
  if (sampleCreator) return sampleCreator;

  const currentUserStr = localStorage.getItem("mock-auth-user");
  const currentProfileStr = localStorage.getItem("mock-auth-profile");

  if (currentUserStr && currentProfileStr) {
    const currentUser = JSON.parse(currentUserStr) as User;
    const currentProfile = JSON.parse(currentProfileStr) as UserProfile;

    if (currentProfile.username === usernameOrUid || currentUser.uid === usernameOrUid) {
      return currentProfile;
    }
  }

  const mockProfilesStr = localStorage.getItem("mock-profiles");
  if (mockProfilesStr) {
    const mockProfiles = JSON.parse(mockProfilesStr) as UserProfile[];
    const foundProfile = mockProfiles.find(
      (profile) => profile.username === usernameOrUid || profile.uid === usernameOrUid
    );
    if (foundProfile) return foundProfile;
  }

  if (usernameOrUid && !usernameOrUid.includes(' ')) {
    const generatedProfile: UserProfile = {
      uid: `generated-${usernameOrUid}`,
      username: usernameOrUid,
      displayName: usernameOrUid.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      bio: `Creator of amazing content`,
      photoURL: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 99)}.jpg`,
      coverPhotoURL: "https://placehold.co/1200x400/gray/white?text=Creator",
      followerCount: Math.floor(Math.random() * 10000),
      followingCount: Math.floor(Math.random() * 500),
      videoCount: Math.floor(Math.random() * 50) + 1,
      likeCount: Math.floor(Math.random() * 100000),
      links: {},
      createdAt: Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
      isVerified: Math.random() > 0.7,
      isCreator: true
    };

    try {
      const mockProfilesStr = localStorage.getItem("mock-profiles");
      const mockProfiles = mockProfilesStr ? JSON.parse(mockProfilesStr) : [];
      mockProfiles.push(generatedProfile);
      localStorage.setItem("mock-profiles", JSON.stringify(mockProfiles));
    } catch (err) {
      console.error("Failed to save generated profile", err);
    }

    return generatedProfile;
  }

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
      links: {
        instagram: "testuser",
        twitter: "testuser",
        youtube: "testuser",
        website: "https://example.com",
      },
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      isVerified: true,
      isCreator: true,
    };
  }

  return null;
};
