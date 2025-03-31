// src/components/auth/RegisterForm.tsx
import React, { useState } from 'react';
import { registerUser } from '@/lib/authService';
import { createUserProfile } from '@/lib/userService';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Register with Firebase Authentication
      const user = await registerUser(email, password, username);
      
      // Create user profile in Firestore
      await createUserProfile(user.uid, {
        username,
        email,
        displayName: username,
        bio: '',
        avatarUrl: `https://ui-avatars.com/api/?name=${username}&background=random`,
        followers: 0,
        following: 0,
        likes: 0
      });
      
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-tiktok-pink hover:bg-tiktok-pink-dark text-white rounded-md"
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
}
