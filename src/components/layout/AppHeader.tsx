import { Link } from 'react-router-dom';

import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { HowToUseButton } from '@/features/how-to-use';
import { appConfig } from '@/config';
import { ROUTES } from '@/constants';

export function AppHeader() {
  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          {appConfig.name}
        </Link>
        <nav aria-label="Main" className="flex items-center gap-3 sm:gap-4">
          <HowToUseButton variant="ghost" />
          <Link
            to={ROUTES.TUTORIAL}
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Tutorial
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
