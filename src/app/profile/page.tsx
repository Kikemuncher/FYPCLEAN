'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/layout/PageLayout';

export default function ProfileRedirect() {
  const router = useRouter();
  const { currentUser, userProfile, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Wait until auth state is determined
    if (!loading && !isRedirecting) {
      setIsRedirecting(true);
      
      // If user is logged in and has a profile, redirect to their username profile
      if (currentUser && userProfile?.username) {
        console.log(`Redirecting to profile: ${userProfile.username}`);
        router.push(`/profile/${userProfile.username}`);
      } else if (!currentUser) {
        // If user is not logged in, redirect to login page
        console.log('No user found, redirecting to login');
        router.push('/auth/login');
      } else {
        console.log('User found but missing profile data', { currentUser });
        // If we have a user but no profile, wait for profile to load or go to login
        router.push('/auth/login');
      }
    }
  }, [currentUser, userProfile, loading, router, isRedirecting]);

  // Show loading state while determining redirect
  return (
    <PageLayout>
      <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.12))]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-white">{loading ? 'Checking authentication...' : 'Redirecting...'}</p>
        </div>
      </div>
    </PageLayout>
  );
}
