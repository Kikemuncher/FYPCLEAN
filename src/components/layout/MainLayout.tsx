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

  const isHomePage = pathname === "/";

  return (
    <div className="min-h-screen bg-black">
      {/* Header Section */}
      {showHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-zinc-800">
          <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
            {showBackButton ? (
              <Link href={backUrl || "/"} className="text-white p-2 -ml-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            ) : (
              <div className="w-10">{/* Spacer */}</div>
            )}

            {title && <h1 className="text-white font-bold text-lg">{title}</h1>}

            {/* Removed TikTok logo dots */}
            {rightAction && <div className="ml-auto">{rightAction}</div>}
          </div>
        </header>
      )}

      {/* Main Content Section */}
      <main className={`w-full max-w-md mx-auto ${showHeader ? "pt-14" : ""}`}>
        {children}
      </main>
    </div>
  );
}
