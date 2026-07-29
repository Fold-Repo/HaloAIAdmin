import { appConfig } from '@/config';

export function AppFooter() {
  return (
    <footer className="border-border mt-auto border-t">
      <div className="text-muted-foreground mx-auto flex max-w-7xl items-center justify-between px-4 py-6 text-sm sm:px-6 lg:px-8">
        <p>
          &copy; {new Date().getFullYear()} {appConfig.name}
        </p>
        <p>v{appConfig.version}</p>
      </div>
    </footer>
  );
}
