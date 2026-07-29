import { useState } from 'react';

import { authService } from '@/features/authentication/services/auth.service';
import type { SocialProvider } from '@/types';

export function useSocialLogin() {
  const [provider, setProvider] = useState<SocialProvider | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const loginWithProvider = (selectedProvider: SocialProvider) => {
    setProvider(selectedProvider);
    setIsRedirecting(true);
    authService.socialLogin(selectedProvider);
  };

  return {
    loginWithProvider,
    provider,
    isRedirecting,
  };
}
