import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants';
import { authService } from '@/features/authentication/services/auth.service';
import { useAuthStore } from '@/store';
import type { ApiError, AuthSession, OtpPurpose } from '@/types';

import { getPostAuthRedirect } from '../utils/auth.utils';

type UseOtpVerificationOptions = {
  email: string;
  purpose: OtpPurpose;
};

export function useOtpVerification({ email, purpose }: UseOtpVerificationOptions) {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const clearPendingOtp = useAuthStore((state) => state.clearPendingOtp);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedCode, setVerifiedCode] = useState('');

  const verifyMutation = useMutation({
    mutationFn: (code: string) =>
      authService.verifyOtp({ email, code, purpose }),
    onSuccess: (response, code) => {
      if ('tokens' in response.data) {
        const session = response.data as AuthSession;
        login(session.user, session.tokens.accessToken, session.tokens.refreshToken);
        clearPendingOtp();
        navigate(getPostAuthRedirect(session.user.onboardingCompleted, session.user.role), {
          replace: true,
        });
        return;
      }

      setIsVerified(true);
      setVerifiedCode(code);
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authService.resendOtp({ email, purpose }),
  });

  const resetMutation = useMutation({
    mutationFn: (payload: { password: string; confirmPassword: string }) =>
      authService.resetPassword({
        email,
        code: verifiedCode,
        ...payload,
      }),
    onSuccess: () => {
      clearPendingOtp();
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { message: 'Password updated. Sign in with your new password.' },
      });
    },
  });

  return {
    verifyOtp: verifyMutation.mutate,
    resendOtp: resendMutation.mutate,
    resetPassword: resetMutation.mutate,
    isVerifying: verifyMutation.isPending,
    isResending: resendMutation.isPending,
    isResetting: resetMutation.isPending,
    verifyError: verifyMutation.error as ApiError | null,
    resetError: resetMutation.error as ApiError | null,
    isVerified,
    purpose,
  };
}
