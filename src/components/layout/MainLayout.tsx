"use client";

import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
  rightAction?: ReactNode;
}

export default function MainLayout({
  children,
  showHeader = false,
  title = "",
  showBackButton = false,
  backUrl = "",
  rightAction,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      {/* 🧱 Main Content */}
      <main className="w-full max-w-md mx-auto">
        {children}
      </main>
    </div>
  );
}
