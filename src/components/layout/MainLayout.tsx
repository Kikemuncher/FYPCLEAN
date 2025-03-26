"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

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
  const pathname = usePathname();
  const { currentUser } = useAuth();

  // ✅ Check if the page is the home page
  const isHomePage = pathname === "/";

  return (
    <div className="min-h-screen bg-black">
      {/* ✅ Header Section */}
      {showHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-zinc-800">
          <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
            {showBackButton ? (
              <Link href={backUrl || "/"} className="text-white p-2 -ml-2">
                <svg
                  xmlns="http://
