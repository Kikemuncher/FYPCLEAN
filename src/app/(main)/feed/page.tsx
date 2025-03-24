// src/app/feed/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main page which contains our FYP
    router.push('/');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );
}
