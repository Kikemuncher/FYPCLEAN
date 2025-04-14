'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import SideNav from '@/components/SideNav';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-black text-white">
        <SideNav />
        <div className="flex-1 pl-16">
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}
