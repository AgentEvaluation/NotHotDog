'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function RootPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        router.push('/tools');
      } else {
        router.push('/login');
      }
    }
  }, [isLoaded, isSignedIn, router]);
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-primary">Loading...</div>
    </div>
  );
}