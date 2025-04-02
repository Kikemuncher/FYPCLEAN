'use client';

import React from 'react';
import { ReactNode, Suspense, useEffect, useState } from 'react';
import { AuthProvider } from '@/hooks/useAuth';

// Define proper types for the ErrorBoundary
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error boundary component with proper TypeScript types
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Client error:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="max-w-md p-4">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="mb-4">{this.state.error?.message || "Unknown error"}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-tiktok-pink rounded-md"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // Handle client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Return loading indicator during SSR
  if (!mounted) {
    return <div>Loading application...</div>;
  }
  
  // Wrap with error boundary
  return (
    <ErrorBoundary>
      <AuthProvider>{children}</AuthProvider>
    </ErrorBoundary>
  );
}
