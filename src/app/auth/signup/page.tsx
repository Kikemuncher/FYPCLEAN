"use client";

export const dynamic = "force-dynamic";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthWrapper from '@/components/auth/AuthWrapper';
import AuthLayout from '@/components/auth/AuthLayout';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { signUp } = useAuth();
  
  const validateUsername = (username: string) => {
    const pattern = /^[a-zA-Z0-9_\.]+$/;
    return pattern.test(username);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    
    // Validate inputs
    if (!email || !password || !username) {
      setFormError("All fields are required");
      setIsSubmitting(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError("Passwords don't match");
      setIsSubmitting(false);
      return;
    }
    
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }
    
    if (!validateUsername(username)) {
      setFormError("Username can only contain letters, numbers, underscores, and periods");
      setIsSubmitting(false);
      return;
    }
    
    try {
      await signUp(email, password, username);
      router.push('/');
    } catch (error: any) {
      console.error("Sign up error:", error);
      setFormError(getAuthErrorMessage(error.code) || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AuthWrapper redirectIfAuthenticated={true} redirectPath="/">
      <AuthLayout
        title="Create an Account"
        subtitle="Join the community"
        footerText="Already have an account?"
        footerLink={{
          text: "Sign in",
          href: "/auth/login"
        }}
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-400">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink"
              placeholder="username"
            />
          </div>
          
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
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink"
              placeholder="••••••••"
            />
          </div>
          
          {(formError) && (
            <div className="text-red-500 text-sm">
              {formError}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-tiktok-pink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tiktok-pink disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      </AuthLayout>
    </AuthWrapper>
  );
}
