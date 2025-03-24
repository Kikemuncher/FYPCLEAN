// src/app/(main)/inbox/page.tsx
"use client";

import { useAuth } from '@/hooks/useAuth';
import { AuthWrapper } from '@/components/auth/AuthWrapper';

export default function InboxPage() {
  const { currentUser } = useAuth();

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-black py-4 px-4">
        <div className="max-w-[500px] mx-auto">
          <h1 className="text-xl font-bold text-white mb-4">Inbox</h1>
          
          <div className="bg-zinc-900 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-semibold">Messages</h2>
              <button className="text-tiktok-pink text-sm">New Message</button>
            </div>
            
            <div className="space-y-4">
              {currentUser ? (
                <div className="text-center py-8">
                  <svg 
                    className="h-12 w-12 mx-auto text-gray-500 mb-3" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                    />
                  </svg>
                  <p className="text-white">No messages yet</p>
                  <p className="text-gray-400 text-sm mt-1">Start conversations with creators you follow</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white">Please log in to view your messages</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-zinc-900 rounded-xl p-4">
            <h2 className="text-white font-semibold mb-4">Notifications</h2>
            
            <div className="text-center py-8">
              <svg 
                className="h-12 w-12 mx-auto text-gray-500 mb-3" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg>
              <p className="text-white">No notifications yet</p>
              <p className="text-gray-400 text-sm mt-1">When you get notifications, they'll show up here</p>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
