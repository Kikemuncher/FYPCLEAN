// src/app/page.tsx
'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Properly typed dynamic import
const FeedList = dynamic(() => import("@/components/feed/FeedList").then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen w-full bg-black">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-white rounded-full mx-auto mb-4"></div>
        <p className="text-white">Loading videos...</p>
      </div>
    </div>
  )
});

export default function Home() {
  return (
    <>
      <Head>
        <title>TikTok Clone</title>
        <meta name="description" content="TikTok Clone - FYP Video Feed" />
      </Head>
      <main>
        <FeedList />
      </main>
    </>
  );
}
