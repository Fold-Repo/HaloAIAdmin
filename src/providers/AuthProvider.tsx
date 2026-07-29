import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { appConfig } from '@/config';
import { authService } from '@/features/authentication/services/auth.service';
import { queryClient } from '@/providers/QueryProvider';
import { useAuthStore } from '@/store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((state) => state.setSession);
  const logout = useAuthStore((state) => state.logout);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const token = localStorage.getItem(appConfig.auth.tokenKey);
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const restoreSession = async () => {
      setLoading(true);
      try {
        const response = await authService.getSession();
        if (cancelled) return;
        const { user, tokens } = response.data;
        setSession(user, tokens.accessToken, tokens.refreshToken);
        await queryClient.invalidateQueries();
      } catch {
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [logout, setLoading, setSession]);

  return children;
}
