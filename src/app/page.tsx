"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import MainLayout from "@/components/layout/MainLayout";
import SideNav from "@/components/layout/SideNav";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

// Dynamically import FeedList with updated typing and loading placeholder
const FeedList = dynamic(() => import("@/components/feed/FeedList").then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen w-full bg-black">
      <p className="text-white">Loading videos...</p>
    </div>
  )
});

// 🔐 Auth buttons component
const AuthButtons = () => {
  const { currentUser, signOut } = useAuth();

  return (
    <div className="fixed top-4 right-4 z-50">
      {currentUser ? (
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-zinc-800 rounded-md text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          Log Out
        </button>
      ) : (
        <div className="flex space-x-3">
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
      )}
    </div>
  );
};

export default function Home(): JSX.Element {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <MainLayout showHeader={true}>
      <div className="relative">
        {/* Always render AuthButtons */}
        <AuthButtons />

        {/* 🧭 Side Navigation */}
        <SideNav />

        {/* 🎬 Video Feed */}
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
