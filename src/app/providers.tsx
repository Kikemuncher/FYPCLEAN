"use client";

import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/useAuth';

// Wrapper for all providers
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
