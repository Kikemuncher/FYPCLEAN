"use client";

import { useState, useEffect } from "react";
import dynamicImport from "next/dynamic"; // Renamed from 'dynamic' to 'dynamicImport'
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

// Export dynamic param for Next.js
export const dynamic = "force-dynamic";

// Dynamically import FeedList with SSR disabled
const FeedList = dynamicImport(() => import("@/components/feed/FeedList"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen w-full bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  )
});

// Auth buttons component 
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
            className="px-4 py-2 bg-pink-600 rounded-md text-white text-sm font-medium hover:bg-pink-700 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const { loading } = useAuth();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <AuthButtons />
      <FeedList />
    </div>
  );
}
