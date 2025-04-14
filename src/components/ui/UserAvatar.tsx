import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface UserAvatarProps {
  src?: string | null;
  username?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showUsername?: boolean;
  linkToProfile?: boolean;
  className?: string;
}

export default function UserAvatar({ 
  src, 
  username = '', 
  size = 'md', 
  showUsername = false,
  linkToProfile = true,
  className = ''
}: UserAvatarProps) {
  const sizeClassMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };
  
  const sizeClass = sizeClassMap[size] || sizeClassMap.md;
  
  const avatar = (
    <div className={`${sizeClass} rounded-full overflow-hidden bg-gray-100 ${className}`}>
      {src ? (
        <img 
          src={src} 
          alt={username || 'User'} 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <span className="text-gray-500 font-medium">
            {username ? username.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>
      )}
    </div>
  );
  
  const content = showUsername ? (
    <div className="flex items-center">
      {avatar}
      {username && <span className="ml-2 text-sm font-medium">{username}</span>}
    </div>
  ) : (
    avatar
  );
  
  if (linkToProfile && username) {
    return (
      <Link href={`/profile/${username}`}>
        {content}
      </Link>
    );
  }
  
  return content;
}
