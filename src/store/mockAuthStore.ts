import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserProfile } from '@/types/user';

interface MockAuthState {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const useMockAuth = create<MockAuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      userProfile: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      signIn: async (email, password) => {
        set({ loading: true, error: null });

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (email === 'test@example.com' && password === 'password') {
          const mockUser: User = {
            uid: 'mock-user-1',
            email,
            displayName: 'Test User',
            photoURL: 'https://placehold.co/400/gray/white?text=User',
            createdAt: Date.now(),
            isVerified: false,
            isCreator: false,
            isAdmin: false,
            accountType: 'user' // ✅ Added
          };

          const mockProfile: UserProfile = {
            uid: 'mock-user-1',
            username: 'testuser',
            displayName: 'Test User',
            bio: 'This is a test user account for offline development',
            photoURL: 'https://placehold.co/400/gray/white?text=User',
            coverPhotoURL: 'https://placehold.co/1200x400/gray/white?text=Cover',
            followerCount: 120,
            followingCount: 85,
            videoCount: 7,
            likeCount: 450,
            links: {
              instagram: 'testuser',
              twitter: 'testuser',
            },
            createdAt: Date.now(),
            isVerified: false,
            isCreator: false,
            accountType: 'user' // ✅ Added
          };

          set({
            currentUser: mockUser,
            userProfile: mockProfile,
            isAuthenticated: true,
            loading: false
          });
        } else {
          set({
            error: 'Invalid email or password',
            loading: false
          });
        }
      },

      signUp: async (email, password, username) => {
        set({ loading: true, error: null });

        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockUser: User = {
          uid: 'mock-user-2',
          email,
          displayName: username,
          photoURL: null,
          createdAt: Date.now(),
          isVerified: false,
          isCreator: false,
          isAdmin: false,
          accountType: 'user' // ✅ Added
        };

        const mockProfile: UserProfile = {
          uid: 'mock-user-2',
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
          accountType: 'user' // ✅ Added
        };

        set({
          currentUser: mockUser,
          userProfile: mockProfile,
          isAuthenticated: true,
          loading: false
        });
      },

      signOut: () => {
        set({
          currentUser: null,
          userProfile: null,
          isAuthenticated: false
        });
      },

      updateUserProfile: async (data) => {
        set({ loading: true, error: null });

        await new Promise(resolve => setTimeout(resolve, 800));

        const { userProfile } = get();
        if (!userProfile) {
          set({
            error: 'No user profile found',
            loading: false
          });
          return;
        }

        const updatedProfile = {
          ...userProfile,
          ...data,
          updatedAt: Date.now()
        };

        set({
          userProfile: updatedProfile,
          loading: false
        });
      }
    }),
    {
      name: 'tiktok-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
