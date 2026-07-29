import { useAuthStore } from '@/store';

/** Wait until session restore finishes before firing authenticated API queries. */
export function useAuthQueryEnabled() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  return isAuthenticated && !isLoading;
}
