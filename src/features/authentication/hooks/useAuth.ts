import { useCallback } from 'react';

import { authService } from '@/features/authentication/services/auth.service';
import { queryClient } from '@/providers/QueryProvider';
import { useAuthStore } from '@/store';
import type { UserRole } from '@/types';

import { getDefaultRouteForRole, getPostAuthRedirect, hasRole } from '../utils/auth.utils';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const logoutStore = useAuthStore((state) => state.logout);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Clear local session even if the API call fails.
    }
    queryClient.clear();
    logoutStore();
  }, [logoutStore]);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    role: user?.role ?? null,
    isOnboarded: user?.onboardingCompleted ?? false,
    getRedirectPath: () => {
      if (!user) return '/login';
      return getPostAuthRedirect(user.onboardingCompleted, user.role);
    },
    getHomePath: () => (user ? getDefaultRouteForRole(user.role) : '/login'),
    hasRole: (roles: UserRole[]) => (user ? hasRole(user.role, roles) : false),
  };
}
