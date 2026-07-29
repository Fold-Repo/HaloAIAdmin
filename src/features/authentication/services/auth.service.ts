import { apiGet, apiPatch, apiPost } from '@/api';
import { appConfig } from '@/config';
import type {
  ApiResponse,
  AuthSession,
  ForgotPasswordPayload,
  LoginCredentials,
  OnboardingPayload,
  OtpPurpose,
  OtpVerificationPayload,
  RegisterCredentials,
  ResetPasswordPayload,
  SocialProvider,
} from '@/types';

const AUTH_BASE = '/auth';

export const authService = {
  login: (credentials: LoginCredentials) =>
    apiPost<ApiResponse<AuthSession>>(`${AUTH_BASE}/login`, credentials),

  register: (credentials: RegisterCredentials) =>
    apiPost<ApiResponse<{ email: string }>>(`${AUTH_BASE}/register`, credentials),

  logout: () => apiPost<ApiResponse<null>>(`${AUTH_BASE}/logout`),

  getSession: () => apiGet<ApiResponse<AuthSession>>(`${AUTH_BASE}/session`),

  refreshToken: (refreshToken: string) =>
    apiPost<ApiResponse<AuthSession>>(`${AUTH_BASE}/refresh`, { refreshToken }),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiPost<ApiResponse<{ email: string }>>(`${AUTH_BASE}/forgot-password`, payload),

  verifyOtp: (payload: OtpVerificationPayload) =>
    apiPost<ApiResponse<AuthSession | { verified: true }>>(
      `${AUTH_BASE}/verify-otp`,
      payload,
    ),

  resendOtp: (payload: { email: string; purpose: OtpPurpose }) =>
    apiPost<ApiResponse<null>>(`${AUTH_BASE}/resend-otp`, payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiPost<ApiResponse<null>>(`${AUTH_BASE}/reset-password`, payload),

  completeOnboarding: (payload: OnboardingPayload) =>
    apiPatch<ApiResponse<AuthSession>>(`${AUTH_BASE}/onboarding`, payload),

  socialLogin: (provider: SocialProvider) => {
    window.location.href = `${appConfig.api.baseUrl}${AUTH_BASE}/oauth/${provider}`;
  },
};
