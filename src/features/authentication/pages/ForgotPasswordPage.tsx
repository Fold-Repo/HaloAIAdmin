import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants';
import { AuthCard } from '@/features/authentication/components/AuthCard';
import { AuthErrorAlert, AuthFormField } from '@/features/authentication/components/AuthFormField';
import { useForgotPassword } from '@/features/authentication/hooks/useForgotPassword';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/authentication/schemas/auth.schemas';

export function ForgotPasswordPage() {
  const { sendResetLink, isPending, error } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  return (
    <AuthCard
      title="Reset your password"
      description="We will send a verification code to your email."
      footer={
        <div className="flex w-full flex-col gap-3">
          <Button
            type="submit"
            form="forgot-password-form"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? 'Sending code...' : 'Send verification code'}
          </Button>
          <Link to={ROUTES.LOGIN} className="text-muted-foreground text-center text-sm hover:underline">
            Back to sign in
          </Link>
        </div>
      }
    >
      <form
        id="forgot-password-form"
        className="space-y-4"
        onSubmit={handleSubmit((values) => sendResetLink(values))}
      >
        <AuthFormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </AuthFormField>
        {error && <AuthErrorAlert message={error.message} />}
      </form>
    </AuthCard>
  );
}
