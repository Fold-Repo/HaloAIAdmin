export type UserRole = 'admin' | 'creator' | 'viewer';

export type SocialProvider = 'google' | 'github' | 'apple';

export type OtpPurpose = 'registration' | 'password-reset' | 'login-2fa';

export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type OtpVerificationPayload = {
  email: string;
  code: string;
  purpose: OtpPurpose;
};

export type ResetPasswordPayload = {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
};

export type OnboardingPayload = {
  displayName: string;
  studioName: string;
  contentType: 'short-drama' | 'series' | 'documentary' | 'other';
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  notificationsEnabled: boolean;
};

export type AuthSession = {
  user: User;
  tokens: AuthTokens;
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingOtpEmail: string | null;
  pendingOtpPurpose: OtpPurpose | null;
};
