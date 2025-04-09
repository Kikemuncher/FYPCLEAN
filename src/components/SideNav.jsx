import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function SideNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  
  const isActive = (path) => pathname === path;
  
  return (
    <div className="w-64 bg-zinc-900 fixed top-0 bottom-0 left-0 border-r border-zinc-800">
      <div className="h-full flex flex-col">
        <div className="p-4">
          <h1 className="text-xl font-bold text-white">TikTok Clone</h1>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-2">
          <Link
            href="/"
            className={`flex items-center px-4 py-3 rounded-md ${isActive('/') ? 'bg-pink-600' : 'hover:bg-zinc-800'}`}
          >
            <span className="mr-3">🏠</span>
            <span>Home</span>
          </Link>
          
          <Link
            href="/discover"
            className={`flex items-center px-4 py-3 rounded-md ${isActive('/discover') ? 'bg-pink-600' : 'hover:bg-zinc-800'}`}
          >
            <span className="mr-3">🔍</span>
            <span>Discover</span>
          </Link>
          
          <Link
            href="/upload"
            className={`flex items-center px-4 py-3 rounded-md ${isActive('/upload') ? 'bg-pink-600' : 'hover:bg-zinc-800'}`}
          >
            <span className="mr-3">➕</span>
            <span>Upload</span>
          </Link>
          
          <Link
            href="/notifications"
            className={`flex items-center px-4 py-3 rounded-md ${isActive('/notifications') ? 'bg-pink-600' : 'hover:bg-zinc-800'}`}
          >
            <span className="mr-3">🔔</span>
            <span>Notifications</span>
          </Link>
          
          <Link
            href="/profile"
            className={`flex items-center px-4 py-3 rounded-md ${isActive('/profile') ? 'bg-pink-600' : 'hover:bg-zinc-800'}`}
          >
            <span className="mr-3">👤</span>
            <span>Profile</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-zinc-800">
          {user ? (
            <div>
              <p className="text-sm text-gray-400">Signed in as</p>
              <p className="font-medium">{user.displayName || 'User'}</p>
              <button
                onClick={signOut}
                className="mt-2 text-sm text-pink-400 hover:text-pink-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="w-full bg-pink-500 text-white py-2 px-4 rounded hover:bg-pink-600 inline-block text-center"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
