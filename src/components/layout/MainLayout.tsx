"use client";

import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  showBackLink?: boolean;
  backLink?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  showLogo = true,
  showBackLink = false,
  backLink = "/"
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-black">
      <div className="m-auto w-full max-w-md p-6 bg-zinc-900 rounded-lg shadow-lg">
        {showBackLink && (
          <div className="mb-4">
            <Link href={backLink} className="text-gray-400 hover:text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
          </div>
        )}
        
        {(title || showLogo) && (
          <div className="text-center mb-8">
            {showLogo && (
              <div className="flex justify-center mb-2">
                <div className="bg-tiktok-pink rounded-full p-2 mr-1">
                  <div className="bg-white rounded-full p-1">
                    <div className="bg-tiktok-pink rounded-full w-5 h-5"></div>
                  </div>
                </div>
                <div className="bg-tiktok-blue rounded-full p-2">
                  <div className="bg-white rounded-full p-1">
                    <div className="bg-tiktok-blue rounded-full w-5 h-5"></div>
                  </div>
                </div>
              </div>
            )}
            
            {title && <h2 className="text-2xl font-bold text-white">{title}</h2>}
            {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
}
