import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants';
import { authService } from '@/features/authentication/services/auth.service';
import { useAuthStore } from '@/store';
import type { ApiError } from '@/types';

import type { ForgotPasswordFormValues } from '../schemas/auth.schemas';

export function useForgotPassword() {
  const navigate = useNavigate();
  const setPendingOtp = useAuthStore((state) => state.setPendingOtp);

  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordFormValues) => authService.forgotPassword(values),
    onSuccess: (response) => {
      setPendingOtp(response.data.email, 'password-reset');
      navigate(ROUTES.OTP_VERIFICATION, {
        state: { email: response.data.email, purpose: 'password-reset' as const },
      });
    },
  });

  return {
    sendResetLink: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error as ApiError | null,
  };
}
