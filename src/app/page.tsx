// Ensure FeedList is being imported and rendered correctly
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import MainLayout from "@/components/layout/MainLayout";
import SideNav from "@/components/layout/SideNav";
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

// Auth buttons component (for users who are not logged in)
const AuthButtons = () => (
  <div className="absolute top-4 right-4 z-30 flex space-x-2">
    <Link href="/auth/login" className="px-3 py-1.5 bg-zinc-800 rounded-full text-white text-sm font-medium hover:bg-zinc-700 transition-colors">
      Log In
    </Link>
    <Link href="/auth/signup" className="px-3 py-1.5 bg-tiktok-pink rounded-full text-white text-sm font-medium hover:bg-pink-700 transition-colors">
      Sign Up
    </Link>
  </div>
);

export default function Home(): JSX.Element {
  const { currentUser, loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <MainLayout showHeader={true}>
      <div className="relative">
        {/* Show Auth Buttons if user is not logged in */}
        {isMounted && !authLoading && !currentUser && <AuthButtons />}

        {/* Side Navigation */}
        <SideNav />

        {/* Render FeedList only on the client */}
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
