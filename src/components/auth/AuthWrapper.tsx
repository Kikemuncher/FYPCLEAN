'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthWrapperProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectIfAuthenticated?: boolean;
  redirectPath?: string;
}

export default function AuthWrapper({
  children,
  requireAuth = false,
  redirectIfAuthenticated = false,
  redirectPath = '/'
}: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If still loading auth state, do nothing yet
    if (loading) return;

    // If requireAuth is true and user is not logged in, redirect to login
    if (requireAuth && !user) {
      router.push('/auth/login');
    }

    // If redirectIfAuthenticated is true and user is logged in, redirect
    if (redirectIfAuthenticated && user) {
      router.push(redirectPath);
    }
  }, [user, loading, requireAuth, redirectIfAuthenticated, redirectPath, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // If requireAuth is true and user is not logged in, don't render children
  if (requireAuth && !user) {
    return null;
  }

  // If redirectIfAuthenticated is true and user is logged in, don't render children
  if (redirectIfAuthenticated && user) {
    return null;
  }

  // Otherwise, render children
  return <>{children}</>;
}
