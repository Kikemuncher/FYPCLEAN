"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireCreator?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireCreator = false 
}: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        // Not logged in, redirect to login
        router.push('/login');
      } else if (requireAdmin && !currentUser.isAdmin) {
        // Not an admin, redirect to home
        router.push('/');
      } else if (requireCreator && !currentUser.isCreator && !currentUser.isAdmin) {
        // Not a creator or admin, redirect to home
        router.push('/');
      }
    }
  }, [currentUser, loading, requireAdmin, requireCreator, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Auth requirements not met, render nothing (will redirect)
  if (
    !currentUser || 
    (requireAdmin && !currentUser.isAdmin) || 
    (requireCreator && !currentUser.isCreator && !currentUser.isAdmin)
  ) {
    return null;
  }

  // Auth requirements are met, render children
  return <>{children}</>;
}
