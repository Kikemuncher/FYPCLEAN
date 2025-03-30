// src/app/creator/apply/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import CreatorApplicationForm from '@/components/profile/CreatorApplicationForm';

export default function CreatorApplicationPage() {
  const router = useRouter();
  
  const handleComplete = () => {
    router.push('/');
  };
  
  const handleCancel = () => {
    router.push('/profile');
  };
  
  return (
    <AuthWrapper requireAuth={true}>
      <CreatorApplicationForm
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </AuthWrapper>
  );
}
