'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function DebugAuth() {
  const auth = useAuth();
  
  useEffect(() => {
    console.log('Auth state in DebugAuth:', {
      currentUser: auth.currentUser ? 'User exists' : 'No user',
      userProfile: auth.userProfile ? 'Profile exists' : 'No profile',
      loading: auth.loading,
      error: auth.error
    });
  }, [auth]);
  
  return (
    <div className="fixed top-0 left-0 bg-black text-white p-2 text-xs z-50">
      Auth: {auth.currentUser ? 'Logged In' : 'Not Logged In'}
    </div>
  );
}
