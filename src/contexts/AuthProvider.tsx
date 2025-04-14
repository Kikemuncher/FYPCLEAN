'use client';

import React from 'react';
import { AuthProvider } from './AuthContext';

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
