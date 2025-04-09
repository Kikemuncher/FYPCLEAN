"use client";

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center py-12 px-6">
      <h1 className="text-3xl font-bold text-white mb-4">Test Page</h1>
      <p className="text-white mb-4">If you can see this page, your Next.js server is running correctly.</p>
      <p className="text-white mb-4">Client-side rendering: {isClient ? 'Working ✅' : 'Not working ❌'}</p>
      <p className="text-gray-400 text-sm">This page doesn't use Firebase to help isolate the issue.</p>
    </div>
  );
}
