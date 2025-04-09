import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footerText?: string;
  footerLink?: {
    text: string;
    href: string;
  };
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLink
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}

          {footerText && footerLink && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {footerText}{' '}
                <Link href={footerLink.href} className="font-medium text-pink-500 hover:text-pink-400">
                  {footerLink.text}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
