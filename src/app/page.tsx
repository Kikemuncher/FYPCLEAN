"use client";

import FeedList from "@/components/feed/FeedList";

export default function Home() {
  return (
    <main className="min-h-screen flex justify-center bg-black">
      <div className="max-w-[500px] w-full">
        <FeedList />
      </div>
    </main>
  );
}
