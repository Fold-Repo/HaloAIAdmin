import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants';
import { authService } from '@/features/authentication/services/auth.service';
import { useAuthStore } from '@/store';
import type { ApiError } from '@/types';

import type { RegisterFormValues } from '../schemas/auth.schemas';

export function useRegister() {
  const navigate = useNavigate();
  const setPendingOtp = useAuthStore((state) => state.setPendingOtp);

  const mutation = useMutation({
    mutationFn: (values: RegisterFormValues) => authService.register(values),
    onSuccess: (response) => {
      setPendingOtp(response.data.email, 'registration');
      navigate(ROUTES.OTP_VERIFICATION, {
        state: { email: response.data.email, purpose: 'registration' as const },
      });
    },
  });

  return {
    register: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error as ApiError | null,
  };
}
