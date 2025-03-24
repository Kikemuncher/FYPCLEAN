"use client";

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

type AuthWrapperProps = {
  children: ReactNode;
  requireAuth?: boolean;
  redirectIfAuthenticated?: boolean;
  redirectPath?: string;
  loginPath?: string;
};

export function AuthWrapper({ 
  children, 
  requireAuth = false,
  redirectIfAuthenticated = false,
  redirectPath = '/',
  loginPath = '/auth/login'
}: AuthWrapperProps) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !currentUser) {
        // Redirect to login if authentication is required but user is not logged in
        router.push(loginPath);
      } else if (redirectIfAuthenticated && currentUser) {
        // Redirect away if user is authenticated but shouldn't be on this page
        router.push(redirectPath);
      }
    }
  }, [currentUser, loading, requireAuth, redirectIfAuthenticated, redirectPath, loginPath, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // If auth check passes, render the children
  return <>{children}</>;
}
