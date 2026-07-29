import { describe, expect, it } from 'vitest';

import {
  loginSchema,
  registerSchema,
  otpSchema,
} from '@/features/authentication/schemas/auth.schemas';
import { getPostAuthRedirect } from '@/features/authentication/utils/auth.utils';

describe('auth schemas', () => {
  it('validates login credentials', () => {
    const result = loginSchema.safeParse({
      email: 'creator@example.com',
      password: 'Password1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid register passwords', () => {
    const result = registerSchema.safeParse({
      name: 'Creator',
      email: 'creator@example.com',
      password: 'password',
      confirmPassword: 'password',
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it('validates otp code length', () => {
    const result = otpSchema.safeParse({ code: '123456' });
    expect(result.success).toBe(true);
  });
});

describe('auth utils', () => {
  it('routes new creators to onboarding', () => {
    expect(getPostAuthRedirect(false, 'creator')).toBe('/onboarding');
  });

  it('routes onboarded admins to admin home', () => {
    expect(getPostAuthRedirect(true, 'admin')).toBe('/admin');
  });
});
