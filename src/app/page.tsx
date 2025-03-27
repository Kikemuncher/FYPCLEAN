"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import MainLayout from "@/components/layout/MainLayout";
import SideNav from "@/components/layout/SideNav";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

// Dynamically load FeedList to avoid SSR hydration mismatch
const FeedList = dynamic(() => import("@/components/feed/FeedList"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen w-full bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  ),
});

// 🔐 Auth buttons shown to guests (not signed in)
const AuthButtons = () => (
  <div className="fixed top-4 right-4 z-50 flex space-x-3">
    <Link
      href="/auth/login"
      className="px-4 py-2 bg-zinc-800 rounded-md text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
    >
      Log In
    </Link>
    <Link
      href="/auth/signup"
      className="px-4 py-2 bg-tiktok-pink rounded-md text-white text-sm font-medium hover:bg-pink-700 transition-colors"
    >
      Sign Up
    </Link>
  </div>
);

export default function Home(): JSX.Element {
  const { currentUser, loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <MainLayout showHeader={true}>
      <div className="relative">
        {/* 🔓 Show login/signup buttons if user is not authenticated */}
        {isMounted && !authLoading && !currentUser && <AuthButtons />}

        {/* 🧭 Left Side Navigation */}
        <SideNav />

        {/* 📺 Feed Display */}
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
