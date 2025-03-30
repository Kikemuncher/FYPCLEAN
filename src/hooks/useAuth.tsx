"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserProfile } from '@/types/user';

const USE_MOCK_AUTH = true;

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  followUser: (targetUid: string) => Promise<void>;
  unfollowUser: (targetUid: string) => Promise<void>;
  isFollowing: (targetUid: string) => boolean;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  isPostLiked: (postId: string) => boolean;
  savePost: (postId: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
  isPostSaved: (postId: string) => boolean;
  getFollowing: () => string[];
  getFollowers: () => string[];
  upgradeToCreator: (creatorData: {
    creatorBio: string;
    creatorCategory: string;
    portfolioLinks: string[];
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useMockAuthState = (): AuthContextType => {
  const router = useRouter();

  const safeParse = (key: string, fallback: any) => {
    if (typeof window === 'undefined') return fallback;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    safeParse('mock-auth-user', null)
  );

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() =>
    safeParse('mock-auth-profile', null)
  );

  const [following, setFollowing] = useState<string[]>(() =>
    safeParse('mock-auth-following', [])
  );

  const [followers, setFollowers] = useState<string[]>(() =>
    safeParse('mock-auth-followers', [])
  );

  const [likedPosts, setLikedPosts] = useState<string[]>(() =>
    safeParse('mock-auth-liked-posts', [])
  );

  const [savedPosts, setSavedPosts] = useState<string[]>(() =>
    safeParse('mock-auth-saved-posts', [])
  );

  useEffect(() => {
    localStorage.setItem('mock-auth-following', JSON.stringify(following));
  }, [following]);

  useEffect(() => {
    localStorage.setItem('mock-auth-followers', JSON.stringify(followers));
  }, [followers]);

  useEffect(() => {
    localStorage.setItem('mock-auth-liked-posts', JSON.stringify(likedPosts));
  }, [likedPosts]);

  useEffect(() => {
    localStorage.setItem('mock-auth-saved-posts', JSON.stringify(savedPosts));
  }, [savedPosts]);

  const followUser = async (targetUid: string) => {
    if (!currentUser || following.includes(targetUid)) return;
    setFollowing([...following, targetUid]);
  };

  const unfollowUser = async (targetUid: string) => {
    setFollowing(following.filter(uid => uid !== targetUid));
  };

  const isFollowing = (targetUid: string) => following.includes(targetUid);
  const isPostLiked = (postId: string) => likedPosts.includes(postId);
  const isPostSaved = (postId: string) => savedPosts.includes(postId);
  const getFollowing = () => following;
  const getFollowers = () => followers;

  const likePost = async (postId: string) => {
    if (!likedPosts.includes(postId)) setLikedPosts([...likedPosts, postId]);
  };

  const unlikePost = async (postId: string) => {
    setLikedPosts(likedPosts.filter(id => id !== postId));
  };

  const savePost = async (postId: string) => {
    if (!savedPosts.includes(postId)) setSavedPosts([...savedPosts, postId]);
  };

  const unsavePost = async (postId: string) => {
    setSavedPosts(savedPosts.filter(id => id !== postId));
  };

  const signUp = async (email: string, password: string, username: string) => {
    const uid = `mock-${Date.now()}`;
    const newUser: User = {
      uid,
      email,
      displayName: username,
      photoURL: null,
      createdAt: Date.now(),
      isVerified: false,
      isCreator: false,
      isAdmin: false,
      accountType: 'user'
    };

    const newProfile: UserProfile = {
      uid,
      username,
      displayName: username,
      bio: '',
      photoURL: 'https://placehold.co/400/gray/white?text=User',
      coverPhotoURL: 'https://placehold.co/1200x400/gray/white?text=Cover',
      followerCount: 0,
      followingCount: 0,
      videoCount: 0,
      likeCount: 0,
      links: {},
      createdAt: Date.now(),
      isVerified: false,
      isCreator: false,
      accountType: 'user'
    };

    setCurrentUser(newUser);
    setUserProfile(newProfile);
    router.push('/auth/onboarding');
  };

  const signIn = async (email: string, password: string) => {
    if (email === 'test@example.com' && password === 'password') {
      const testUser: User = {
        uid: 'mock-test-user',
        email,
        displayName: 'Test User',
        photoURL: null,
        createdAt: Date.now(),
        isVerified: true,
        isCreator: true,
        isAdmin: false,
        accountType: 'creator'
      };
      const testProfile: UserProfile = {
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
        links: {},
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        isVerified: true,
        isCreator: true,
        accountType: 'creator'
      };

      setCurrentUser(testUser);
      setUserProfile(testProfile);
      router.push('/');
    }
  };

  const signOut = async () => {
    setCurrentUser(null);
    setUserProfile(null);
    router.push('/auth/login');
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...data };
    setUserProfile(updated);
  };

  const upgradeToCreator = async ({
    creatorBio,
    creatorCategory,
    portfolioLinks
  }: {
    creatorBio: string;
    creatorCategory: string;
    portfolioLinks: string[];
  }): Promise<void> => {
    if (!userProfile || !currentUser) return;

    const updatedUser = {
      ...currentUser,
      isCreator: true,
      accountType: 'creator' as const
    };

    const updatedProfile = {
      ...userProfile,
      isCreator: true,
      accountType: 'creator' as const,
      creatorBio,
      creatorCategory,
      portfolioLinks
    };

    setCurrentUser(updatedUser);
    setUserProfile(updatedProfile);
  };

  return {
    currentUser,
    userProfile,
    loading: false,
    error: null,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    followUser,
    unfollowUser,
    isFollowing,
    likePost,
    unlikePost,
    isPostLiked,
    savePost,
    unsavePost,
    isPostSaved,
    getFollowing,
    getFollowers,
    upgradeToCreator
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const mock = useMockAuthState();
  return <AuthContext.Provider value={mock}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
