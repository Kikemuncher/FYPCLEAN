// src/components/layout/SideNav.tsx
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/authService';
import { useRouter } from 'next/navigation';

export default function SideNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };
  
  // Your existing SideNav code here, but replace the user-related sections with:
  
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <Link href="/" className="text-xl font-bold text-tiktok-pink">
          TikTok Clone
        </Link>
      </div>
      
      <div className="px-4 py-2">
        {/* Navigation links */}
        <nav className="space-y-2">
          <Link href="/" className="flex items-center p-2 hover:bg-gray-100 rounded-md">
            <span>Home</span>
          </Link>
          <Link href="/explore" className="flex items-center p-2 hover:bg-gray-100 rounded-md">
            <span>Explore</span>
          </Link>
          {/* Add your other navigation links */}
        </nav>
      </div>
      
      <div className="px-4 py-4 border-t border-gray-200">
        {loading ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
            </div>
          </div>
        ) : user ? (
          <div className="space-y-3">
            <Link href={`/profile/${user.displayName}`} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt={user.displayName || 'User'} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{user.displayName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </Link>
            <button 
              onClick={handleSignOut}
              className="w-full text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-left"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link 
              href="/login" 
              className="block w-full text-center text-sm py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="block w-full text-center text-sm py-2 px-4 bg-tiktok-pink hover:bg-tiktok-pink-dark text-white rounded-md"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
