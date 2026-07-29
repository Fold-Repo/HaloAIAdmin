import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants';
import { AuthCard } from '@/features/authentication/components/AuthCard';
import { AuthErrorAlert, AuthFormField } from '@/features/authentication/components/AuthFormField';
import { AuthLink } from '@/features/authentication/components/AuthLink';
import { PasswordInput } from '@/features/authentication/components/PasswordInput';
import { SocialLoginButtons } from '@/features/authentication/components/SocialLoginButtons';
import { useRegister } from '@/features/authentication/hooks/useRegister';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/authentication/schemas/auth.schemas';

export function RegisterPage() {
  const { register: submitRegister, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  return (
    <AuthCard
      title="Create your account"
      description="Start building AI-powered content in minutes."
      footer={
        <div className="w-full space-y-4">
          <Button
            type="submit"
            form="register-form"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? 'Creating account...' : 'Create account'}
          </Button>
          <AuthLink prompt="Already have an account?" linkText="Sign in" to={ROUTES.LOGIN} />
        </div>
      }
    >
      <form
        id="register-form"
        className="space-y-4"
        onSubmit={handleSubmit((values) => submitRegister(values))}
      >
        <AuthFormField id="name" label="Full name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register('name')} />
        </AuthFormField>

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
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
        </AuthFormField>

        <AuthFormField
          id="confirmPassword"
          label="Confirm password"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </AuthFormField>

        <Controller
          name="acceptTerms"
          control={control}
          render={({ field }) => (
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={!!errors.acceptTerms}
              />
              <span>I agree to the Terms of Service and Privacy Policy</span>
            </label>
          )}
        />
        {errors.acceptTerms && (
          <p className="text-destructive text-sm">{errors.acceptTerms.message}</p>
        )}

        {error && <AuthErrorAlert message={error.message} />}
      </form>

      <div className="mt-6">
        <SocialLoginButtons />
      </div>
    </AuthCard>
  );
}
