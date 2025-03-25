// src/store/mockAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserProfile } from '@/types/user';

// ...same interface as before

export const useMockAuth = create<MockAuthState>()(
  persist(
    (set, get) => ({
      // Same implementation as before
      currentUser: null,
      userProfile: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      
      // Auth methods that now persist to localStorage
      signIn: async (email, password) => {
        // ... implementation as before
      },
      
      signUp: async (email, password, username) => {
        // ... implementation as before
      },
      
      signOut: () => {
        // ... implementation as before
      },
      
      updateUserProfile: async (data) => {
        // ... implementation as before  
      }
    }),
    {
      name: 'tiktok-auth-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
