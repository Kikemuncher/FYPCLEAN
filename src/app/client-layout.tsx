'use client';

// src/app/client-layout.tsx
import { ReactNode, Suspense } from 'react';
import { AuthProvider } from '@/context/AuthContext';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Suspense>
  );
}
