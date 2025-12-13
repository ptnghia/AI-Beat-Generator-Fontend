'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/lib/stores/admin-auth-store';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAdminAuthStore();

  useEffect(() => {
    checkAuth();
    
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router, checkAuth]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
