import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Navigate, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { AuthCard } from '@/features/authentication/components/AuthCard';
import { AuthErrorAlert } from '@/features/authentication/components/AuthFormField';
import { OtpInput } from '@/features/authentication/components/OtpInput';
import { PasswordInput } from '@/features/authentication/components/PasswordInput';
import { useOtpVerification } from '@/features/authentication/hooks/useOtpVerification';
import {
  otpSchema,
  resetPasswordSchema,
  type OtpFormValues,
  type ResetPasswordFormValues,
} from '@/features/authentication/schemas/auth.schemas';
import { useAuthStore } from '@/store';
import type { OtpPurpose } from '@/types';

type OtpLocationState = {
  email?: string;
  purpose?: OtpPurpose;
};

export function OtpVerificationPage() {
  const location = useLocation();
  const locationState = (location.state as OtpLocationState | null) ?? {};
  const pendingOtpEmail = useAuthStore((state) => state.pendingOtpEmail);
  const pendingOtpPurpose = useAuthStore((state) => state.pendingOtpPurpose);

  const email = locationState.email ?? pendingOtpEmail;
  const purpose = locationState.purpose ?? pendingOtpPurpose;

  const {
    verifyOtp,
    resendOtp,
    resetPassword,
    isVerifying,
    isResending,
    isResetting,
    verifyError,
    resetError,
    isVerified,
  } = useOtpVerification({
    email: email ?? '',
    purpose: purpose ?? 'registration',
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    otpForm.reset({ code: '' });
  }, [email, purpose, otpForm]);

  if (!email || !purpose) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const title =
    purpose === 'password-reset'
      ? 'Verify reset code'
      : purpose === 'login-2fa'
        ? 'Two-factor authentication'
        : 'Verify your email';

  const description =
    purpose === 'password-reset'
      ? `Enter the code sent to ${email} to reset your password.`
      : `Enter the 6-digit code sent to ${email}.`;

  return (
    <AuthCard
      title={title}
      description={description}
      footer={
        !isVerified ? (
          <div className="flex w-full flex-col gap-3">
            <Button
              type="submit"
              form="otp-form"
              className="w-full"
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify code'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isResending}
              onClick={() => resendOtp()}
            >
              {isResending ? 'Resending...' : 'Resend code'}
            </Button>
          </div>
        ) : (
          <Button
            type="submit"
            form="reset-password-form"
            className="w-full"
            disabled={isResetting}
          >
            {isResetting ? 'Updating password...' : 'Update password'}
          </Button>
        )
      }
    >
      {!isVerified ? (
        <form
          id="otp-form"
          className="space-y-4"
          onSubmit={otpForm.handleSubmit((values) => verifyOtp(values.code))}
        >
          <Controller
            name="code"
            control={otpForm.control}
            render={({ field }) => (
              <OtpInput
                value={field.value}
                onChange={field.onChange}
                disabled={isVerifying}
                error={!!otpForm.formState.errors.code}
              />
            )}
          />
          {otpForm.formState.errors.code && (
            <p className="text-destructive text-center text-sm">
              {otpForm.formState.errors.code.message}
            </p>
          )}
          {verifyError && <AuthErrorAlert message={verifyError.message} />}
        </form>
      ) : (
        <form
          id="reset-password-form"
          className="space-y-4"
          onSubmit={resetForm.handleSubmit((values) => resetPassword(values))}
        >
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              New password
            </label>
            <PasswordInput id="password" {...resetForm.register('password')} />
            {resetForm.formState.errors.password && (
              <p className="text-destructive text-sm">
                {resetForm.formState.errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm password
            </label>
            <PasswordInput
              id="confirmPassword"
              {...resetForm.register('confirmPassword')}
            />
            {resetForm.formState.errors.confirmPassword && (
              <p className="text-destructive text-sm">
                {resetForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          {resetError && <AuthErrorAlert message={resetError.message} />}
        </form>
      )}
    </AuthCard>
  );
}
