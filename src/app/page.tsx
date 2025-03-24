// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

// Import FeedList component with no SSR to prevent hydration issues
const FeedList = dynamic(() => import("@/components/feed/FeedList"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen w-full bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  ),
});

export default function Home(): JSX.Element {
  const { currentUser, loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth buttons to show when user is not logged in
  const AuthButtons = () => (
    <div className="absolute top-4 right-4 z-30 flex space-x-2">
      <Link href="/auth/login" className="px-3 py-1.5 bg-zinc-800 rounded-full text-white text-sm font-medium">
        Log In
      </Link>
      <Link href="/auth/signup" className="px-3 py-1.5 bg-tiktok-pink rounded-full text-white text-sm font-medium">
        Sign Up
      </Link>
    </div>
  );

  // Only render FeedList on the client to avoid hydration errors
  return (
    <MainLayout showHeader={true}>
      <div className="relative">
        {isMounted && !authLoading && !currentUser && <AuthButtons />}
        
        {isMounted ? (
          <FeedList />
        ) : (
          <div className="flex items-center justify-center h-screen w-full bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
