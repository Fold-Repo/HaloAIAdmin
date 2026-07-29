import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useAuth } from '@/features/authentication/hooks/useAuth';

export function UnauthorizedPage() {
  const { getHomePath } = useAuth();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold">403</h1>
      <p className="text-muted-foreground max-w-md">
        You do not have permission to access this page.
      </p>
      <Button asChild>
        <Link to={getHomePath() ?? ROUTES.HOME}>Go to your workspace</Link>
      </Button>
    </div>
  );
}
