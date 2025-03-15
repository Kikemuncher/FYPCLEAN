"use client";

import React, { useEffect, useState } from 'react';

// Minimal FeedList component that will definitely build as a module
function FeedList() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex items-center justify-center bg-black text-white text-center p-4">
      <div>
        <h1 className="text-2xl font-bold mb-4">TikTok Feed</h1>
        <p>Videos will appear here once the module issue is fixed.</p>
      </div>
    </div>
  );
}

// Explicit default export
export default FeedList;
