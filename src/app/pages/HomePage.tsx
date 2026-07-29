import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ROUTES } from '@/constants';
import { DEMO_LOGIN, SEED_PROJECT_REF } from '@/features/tutorial/content/tutorial-content';
import { useAuthStore } from '@/store';

export function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section className="flex flex-col items-center gap-8 py-16 text-center">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">AI Creator Studio</h1>
        <p className="text-muted-foreground text-lg">
          Build, manage, and publish AI-generated vertical episodes — from story bible to
          analytics.
        </p>
      </div>

      <div className="grid w-full max-w-3xl gap-4 text-left sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Get started</CardTitle>
            <CardDescription>
              Sign in with a demo account or open the step-by-step tutorial.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {isAuthenticated ? (
              <Button asChild>
                <Link to={ROUTES.DASHBOARD}>Go to Dashboard</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to={ROUTES.LOGIN}>Sign in</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to={ROUTES.TUTORIAL}>Read the Tutorial</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo accounts</CardTitle>
            <CardDescription>Live API — not mock data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">{DEMO_LOGIN.creator.name}</p>
              <p className="text-muted-foreground">
                <code>{DEMO_LOGIN.creator.email}</code> / <code>{DEMO_LOGIN.creator.password}</code>
              </p>
            </div>
            <div>
              <p className="font-medium">{DEMO_LOGIN.admin.name}</p>
              <p className="text-muted-foreground">
                <code>{DEMO_LOGIN.admin.email}</code> / <code>{DEMO_LOGIN.admin.password}</code>
              </p>
            </div>
            <p className="text-muted-foreground text-xs">
              Sample project: {SEED_PROJECT_REF.title} ({SEED_PROJECT_REF.series})
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
