// src/app/providers.tsx
"use client";

import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import FirebaseProvider from '@/components/firebase/FirebaseProvider';

export default function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div>Loading...</div>;
  }
  
  return (
    <FirebaseProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </FirebaseProvider>
  );
}
