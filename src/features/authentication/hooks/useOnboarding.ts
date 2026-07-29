import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { authService } from '@/features/authentication/services/auth.service';
import { useAuthStore } from '@/store';
import type { ApiError } from '@/types';

import { getPostAuthRedirect } from '../utils/auth.utils';
import type { OnboardingFormValues } from '../schemas/auth.schemas';

export function useOnboarding() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const mutation = useMutation({
    mutationFn: (values: OnboardingFormValues) => authService.completeOnboarding(values),
    onSuccess: (response) => {
      const { user: updatedUser, tokens } = response.data;
      setSession(updatedUser, tokens.accessToken, tokens.refreshToken);
      completeOnboarding();
      navigate(getPostAuthRedirect(true, updatedUser.role), { replace: true });
    },
  });

  return {
    completeOnboarding: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error as ApiError | null,
    defaultValues: {
      displayName: user?.name ?? '',
      studioName: '',
      contentType: 'short-drama' as const,
      experienceLevel: 'beginner' as const,
      notificationsEnabled: true,
    },
  };
}
