import { Github } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SOCIAL_PROVIDERS } from '@/constants';
import { useSocialLogin } from '@/features/authentication/hooks/useSocialLogin';
import type { SocialProvider } from '@/types';

function ProviderIcon({ provider }: { provider: SocialProvider }) {
  if (provider === 'github') {
    return <Github className="size-4" aria-hidden="true" />;
  }

  return (
    <span className="text-xs font-semibold uppercase" aria-hidden="true">
      {provider[0]}
    </span>
  );
}

export function SocialLoginButtons() {
  const { loginWithProvider, isRedirecting, provider } = useSocialLogin();

  return (
    <div className="space-y-4">
      <div className="relative">
        <Separator />
        <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs">
          Or continue with
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {SOCIAL_PROVIDERS.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant="outline"
            disabled={isRedirecting}
            aria-label={`Continue with ${item.label}`}
            onClick={() => loginWithProvider(item.id)}
          >
            <ProviderIcon provider={item.id} />
            <span className="sr-only">{item.label}</span>
            {isRedirecting && provider === item.id ? '...' : item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
