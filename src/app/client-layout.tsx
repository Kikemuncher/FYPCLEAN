'use client';

// src/app/client-layout.tsx
import { ReactNode, Suspense, useEffect, useState } from 'react';
import { AuthProvider } from '@/hooks/useAuth';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div>Loading...</div>;
  }
  
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
