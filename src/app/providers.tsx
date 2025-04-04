// src/app/providers.tsx
"use client";

import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@/hooks/useAuth';  // This import must be correct

export default function Providers({ children }: { children: ReactNode }) {
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
