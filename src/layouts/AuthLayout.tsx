import { Outlet } from 'react-router-dom';

import { HowToUseButton } from '@/features/how-to-use';
import { appConfig } from '@/config';

export function AuthLayout() {
  return (
    <div className="bg-muted/30 flex min-h-screen flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{appConfig.name}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Sign in to continue</p>
        <div className="mt-3 flex justify-center">
          <HowToUseButton variant="secondary" size="sm" />
        </div>
      </div>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
