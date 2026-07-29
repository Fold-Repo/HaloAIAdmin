import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { appConfig } from '@/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants';
import { AuthCard } from '@/features/authentication/components/AuthCard';
import { AuthErrorAlert, AuthFormField } from '@/features/authentication/components/AuthFormField';
import { AuthLink } from '@/features/authentication/components/AuthLink';
import { DemoLoginPanel } from '@/features/authentication/components/DemoLoginPanel';
import { PasswordInput } from '@/features/authentication/components/PasswordInput';
import { SocialLoginButtons } from '@/features/authentication/components/SocialLoginButtons';
import { useLogin } from '@/features/authentication/hooks/useLogin';
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/authentication/schemas/auth.schemas';

export function LoginPage() {
  const { login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const fillDemoAccount = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Enter your credentials to access the studio."
      footer={
        <div className="w-full space-y-4">
          <Button
            type="submit"
            form="login-form"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
          <AuthLink prompt="Don't have an account?" linkText="Create one" to={ROUTES.REGISTER} />
        </div>
      }
    >
      <form id="login-form" className="space-y-4" onSubmit={handleSubmit((values) => login(values))}>
        <AuthFormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </AuthFormField>

        <AuthFormField id="password" label="Password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
        </AuthFormField>

        <div className="text-right">
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-muted-foreground text-sm hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {error && <AuthErrorAlert message={error.message} />}
      </form>

      {appConfig.isDev && (
        <div className="mt-4">
          <DemoLoginPanel onUseAccount={fillDemoAccount} />
        </div>
      )}

      <div className="mt-6">
        <SocialLoginButtons />
      </div>
    </AuthCard>
  );
}
