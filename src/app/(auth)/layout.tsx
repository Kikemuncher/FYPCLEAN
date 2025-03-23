// src/app/(main)/layout.tsx
"use client";

import { ReactNode } from 'react';
import BottomNav from '@/components/layout/BottomNav';

export default function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black pb-16">
      {children}
      <BottomNav />
    </div>
  );
}
