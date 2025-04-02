"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SideNav from '@/components/layout/SideNav';

export const dynamic = "force-dynamic";
export default function ProfileRedirect() {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (currentUser && userProfile) {
        // Redirect to the user's profile page
        router.push(`/profile/${userProfile.username || ''}`);
      } else if (!currentUser) {
        // Not logged in, redirect to login
        router.push('/auth/login');
      }
    }
  }, [currentUser, userProfile, loading, router]);

  return (
    <div className="min-h-screen bg-black">
      <SideNav />
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    </div>
  );
}
