'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import FeedVideos from '@/components/feed/FeedVideos';
import SideNav from '@/components/SideNav';

export default function Home() {
  const { currentUser } = useAuth();
  const [sideCollapsed, setSideCollapsed] = useState(false);

  // Sidebar width: 256px (open), 80px (collapsed)
  const sidebarWidth = sideCollapsed ? 80 : 256;

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Only render SideNav ONCE here */}
      <SideNav onCollapseChange={setSideCollapsed} />
      <main
        className="flex-1 flex items-center justify-center transition-all duration-200"
        style={{
          marginLeft: sidebarWidth,
        }}
      >
        {/* Center content between sidebar and right edge */}
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PageLayout fullWidth={true}>
            <FeedVideos />
          </PageLayout>
        </div>
      </main>
    </div>
  );
}
