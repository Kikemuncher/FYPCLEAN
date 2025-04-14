'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PageLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  fullWidth?: boolean;
}

export default function PageLayout({ 
  children, 
  showSidebar = true,
  fullWidth = false
}: PageLayoutProps) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <div className={`
        ${showSidebar ? "ml-64" : ""} 
        ${fullWidth ? "" : "p-6"}
        ${fullWidth ? "h-screen overflow-hidden" : ""}
      `}>
        {children}
      </div>
    </div>
  );
}
