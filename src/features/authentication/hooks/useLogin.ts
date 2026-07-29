import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';

import { ROUTES } from '@/constants';
import { authService } from '@/features/authentication/services/auth.service';
import { useAuthStore } from '@/store';
import type { ApiError } from '@/types';

import { getPostAuthRedirect } from '../utils/auth.utils';
import type { LoginFormValues } from '../schemas/auth.schemas';

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) => authService.login(values),
    onSuccess: async (response) => {
      const { user, tokens } = response.data;
      login(user, tokens.accessToken, tokens.refreshToken);
      await queryClient.invalidateQueries();

      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
      const destination =
        from && from !== ROUTES.LOGIN
          ? from
          : getPostAuthRedirect(user.onboardingCompleted, user.role);

      navigate(destination, { replace: true });
    },
  });

  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error as ApiError | null,
  };
}
