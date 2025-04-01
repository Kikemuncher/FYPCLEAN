'use client';

// src/app/client-layout.tsx
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
