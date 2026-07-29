export { AuthCard } from './components/AuthCard';
export { AuthErrorAlert, AuthFormField } from './components/AuthFormField';
export { AuthLink } from './components/AuthLink';
export { OtpInput } from './components/OtpInput';
export { PasswordInput } from './components/PasswordInput';
export { SocialLoginButtons } from './components/SocialLoginButtons';
export { OnboardingWizard } from './components/onboarding/OnboardingWizard';

export { useAuth } from './hooks/useAuth';
export { useForgotPassword } from './hooks/useForgotPassword';
export { useLogin } from './hooks/useLogin';
export { useOnboarding } from './hooks/useOnboarding';
export { useOtpVerification } from './hooks/useOtpVerification';
export { useRegister } from './hooks/useRegister';
export { useSocialLogin } from './hooks/useSocialLogin';

export {
  ForgotPasswordPage,
  LoginPage,
  OnboardingPage,
  OtpVerificationPage,
  RegisterPage,
  UnauthorizedPage,
} from './pages';

export {
  OnboardingRoute,
  ProtectedRoute,
  PublicRoute,
} from './routes/ProtectedRoute';
export { RoleRoute } from './routes/RoleRoute';

export {
  forgotPasswordSchema,
  loginSchema,
  onboardingSchema,
  otpSchema,
  registerSchema,
  resetPasswordSchema,
} from './schemas/auth.schemas';

export { getDefaultRouteForRole, getPostAuthRedirect, hasRole } from './utils/auth.utils';

export { authService } from './services/auth.service';
