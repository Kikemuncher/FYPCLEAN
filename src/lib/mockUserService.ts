import { UserProfile } from "@/types/user";
import { db } from './firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

// Sample creator profiles
const SAMPLE_CREATORS: UserProfile[] = [
  {
    uid: "creator-mixkit_user",
    username: "mixkit_user",
    displayName: "Holiday Creator",
    bio: "I create festive content for all seasons! 🎄✨",
    photoURL: "https://randomuser.me/api/portraits/women/44.jpg",
    coverPhotoURL: "https://placehold.co/1200x400/gray/white?text=Holiday+Creator",
    followerCount: 0,
    followingCount: 0,
    videoCount: 0,
    likeCount: 0,
    links: {
      instagram: "holidaycreator",
      twitter: "holidaycreator",
    },
    createdAt: Date.now() - 190 * 24 * 60 * 60 * 1000,
    isVerified: true,
    isCreator: true,
    accountType: 'creator'
  },
  {
    uid: "creator-nature_lover",
    username: "nature_lover",
    displayName: "Nature Enthusiast",
    bio: "Exploring the outdoors and sharing the beauty of nature 🌲🏕️",
    photoURL: "https://randomuser.me/api/portraits/women/65.jpg",
    coverPhotoURL: "https://placehold.co/1200x400/228B22/white?text=Nature+Lover",
    followerCount: 0,
    followingCount: 0,
    videoCount: 0,
    likeCount: 0,
    links: {
      instagram: "naturelovers",
      twitter: "naturelover",
      youtube: "naturelover",
    },
    createdAt: Date.now() - 280 * 24 * 60 * 60 * 1000,
    isVerified: true,
    isCreator: true,
    accountType: 'creator'
  },
  {
    uid: "creator-neon_vibes",
    username: "neon_vibes",
    displayName: "Neon Dreams",
    bio: "Bringing color to your life through neon aesthetics 💜💙💖",
    photoURL: "https://randomuser.me/api/portraits/women/22.jpg",
    coverPhotoURL: "https://placehold.co/1200x400/8A2BE2/white?text=Neon+Vibes",
    followerCount: 0,
    followingCount: 0,
    videoCount: 0,
    likeCount: 0,
    links: {
      instagram: "neonvibes",
      twitter: "neonvibes",
      website: "https://neonvibes.example.com",
    },
    createdAt: Date.now() - 360 * 24 * 60 * 60 * 1000,
    isVerified: true,
    isCreator: true,
    accountType: 'creator'
  },
  {
    uid: "creator-user1",
    username: "user1",
    displayName: "User One",
    bio: "Sample creator bio",
    photoURL: "https://randomuser.me/api/portraits/women/85.jpg",
    coverPhotoURL: "https://placehold.co/1200x400/gray/white?text=Cover",
    followerCount: 0,
    followingCount: 0,
    videoCount: 0,
    likeCount: 0,
    links: {},
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    isVerified: true,
    isCreator: true,
    accountType: 'creator'
  }
];

export const getUserProfileByUsername = async (usernameOrUid: string): Promise<UserProfile | null> => {

  const sampleCreator = SAMPLE_CREATORS.find(
    creator => creator.username === usernameOrUid || creator.uid === usernameOrUid
  );
  if (sampleCreator) return sampleCreator;

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', usernameOrUid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
    }

    const userDocRef = doc(db, 'users', usernameOrUid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
    }

    if (usernameOrUid && !usernameOrUid.includes(" ")) {
      const generatedProfile: UserProfile = {
        uid: `generated-${usernameOrUid}`,
        username: usernameOrUid,
        displayName: usernameOrUid
          .split("_")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        bio: "Creator of amazing content",
        photoURL: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "women" : "men"}/${Math.floor(Math.random() * 99)}.jpg`,
        coverPhotoURL: "https://placehold.co/1200x400/gray/white?text=Creator",
        followerCount: 0,
        followingCount: 0,
        videoCount: 0,
        likeCount: 0,
        links: {},
        createdAt: Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
        isVerified: Math.random() > 0.7,
        isCreator: true,
        accountType: 'creator'
      };

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
        followerCount: 0,
        followingCount: 0,
        videoCount: 0,
        likeCount: 0,
        links: {
          instagram: "testuser",
          twitter: "testuser",
          youtube: "testuser",
          website: "https://example.com",
        },
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        isVerified: true,
        isCreator: true,
        accountType: 'creator'
      };
    }

    // 🚨 Final fallback
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};
