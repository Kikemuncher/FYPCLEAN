"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import AuthLayout from '@/components/layout/AuthLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, error } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AuthWrapper redirectIfAuthenticated={true} redirectPath="/">
      <AuthLayout 
        title="Welcome Back" 
        subtitle="Login to your account"
        showLogo={true}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink"
              placeholder="name@example.com"
              required
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                Password
              </label>
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="text-tiktok-blue hover:text-blue-400">
                  Forgot password?
                </Link>
              </div>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink"
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-tiktok-pink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tiktok-pink disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-tiktok-blue hover:text-blue-400">
              Sign up
            </Link>
          </p>
        </div>
      </AuthLayout>
    </AuthWrapper>
  );
}
