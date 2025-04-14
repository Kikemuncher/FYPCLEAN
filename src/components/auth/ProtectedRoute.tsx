// src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
  redirectAuthenticatedTo?: string;
  requiredRoles?: ('user' | 'creator' | 'admin')[];
}

export default function ProtectedRoute({
  children,
  redirectTo = '/auth/login',
  redirectIfAuthenticated = false,
  redirectAuthenticatedTo = '/',
  requiredRoles = []
}: ProtectedRouteProps) {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Don't make any decisions until auth state is determined
    if (loading) return;

    // Determine authorization
    let isAuthorized = !!currentUser;

    // Check role requirements if user is logged in and roles are specified
    if (isAuthorized && requiredRoles.length > 0 && userProfile) {
      const userRole = userProfile.isAdmin ? 'admin' : userProfile.isCreator ? 'creator' : 'user';
      isAuthorized = requiredRoles.includes(userRole);
    }

    // Handle redirections
    if (!isAuthorized && !redirectIfAuthenticated) {
      router.push(redirectTo);
    } else if (isAuthorized && redirectIfAuthenticated) {
      router.push(redirectAuthenticatedTo);
    }

    setAuthorized(isAuthorized && !redirectIfAuthenticated);
  }, [
    loading, 
    currentUser, 
    userProfile, 
    redirectIfAuthenticated, 
    redirectTo, 
    redirectAuthenticatedTo,
    requiredRoles,
    router
  ]);

  // Show loading state while checking authentication
  if (loading || authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Return children only if authorized
  return authorized ? <>{children}</> : null;
}
