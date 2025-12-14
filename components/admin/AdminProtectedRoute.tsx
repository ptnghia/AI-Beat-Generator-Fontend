'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/lib/stores/admin-auth-store';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAdminAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after mount
    setIsHydrated(true);
    // Restore auth state from localStorage
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Only redirect after hydration to avoid flash
    if (isHydrated && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  // Show nothing while hydrating or not authenticated
  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
