'use client';

import React, { useState, useEffect } from 'react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionSpeed, setConnectionSpeed] = useState<string | null>(null);

  // Check network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial network status
    setIsOnline(navigator.onLine);

    // Check connection speed if available
    if ('connection' in navigator && (navigator as any).connection) {
      const connection = (navigator as any).connection;
      const updateConnectionInfo = () => {
        if (connection.effectiveType) {
          setConnectionSpeed(connection.effectiveType);
        }
      };

      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();

      return () => {
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
      You are offline. Some features may not work properly.
    </div>
  );
}
