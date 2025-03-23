"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signUp, error } = useAuth();
  
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
    } catch (error) {
      console.error("Sign up error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-black">
      <div className="m-auto w-full max-w-md p-6 bg-zinc-900 rounded-lg shadow-lg">
        <div className="text-center mb-8">
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
          <h2 className="text-2xl font-bold text-white">Create an Account</h2>
          <p className="text-gray-400 mt-1">Join the community</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          {(formError || error) && (
            <div className="text-red-500 text-sm">
              {formError || error}
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
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-tiktok-blue hover:text-blue-400">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
