'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/tools');
  }, [router]);
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-primary">Loading...</div>
    </div>
  );
}