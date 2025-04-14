'use client';

import React, { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import SideNav from '@/components/SideNav';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Use this to prevent hydration mismatches
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Only render the UI after client-side hydration is complete
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-black">
        <SideNav />
        {children}
      </div>
    </AuthProvider>
  );
}
