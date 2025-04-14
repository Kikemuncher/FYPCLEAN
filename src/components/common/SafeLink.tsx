'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SafeLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
};

export default function SafeLink({ 
  href, 
  children, 
  className = '', 
  activeClassName = '' 
}: SafeLinkProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isActive = pathname === href;
  
  // Only enable client-side behaviors after hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // During initial render, provide a simple version
  if (!mounted) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }
  
  // After hydration, provide the full Link behavior
  return (
    <Link 
      href={href} 
      className={`${className} ${isActive ? activeClassName : ''}`}
    >
      {children}
    </Link>
  );
}
