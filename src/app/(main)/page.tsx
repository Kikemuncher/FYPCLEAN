// src/app/(main)/page.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

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
  // Track whether we're in the browser
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render FeedList on the client to avoid hydration errors
  return (
    <main className="min-h-screen flex justify-center bg-black">
      <div className="max-w-[500px] w-full">
        {isMounted ? (
          <FeedList />
        ) : (
          <div className="flex items-center justify-center h-screen w-full bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </main>
  );
}
