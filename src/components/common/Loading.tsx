import { Loader2 } from 'lucide-react';

import { cn } from '@/utils';

type SpinnerProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeMap = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
};

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-muted-foreground', sizeMap[size], className)}
      aria-hidden="true"
    />
  );
}

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="bg-muted h-8 w-1/3 rounded" />
      <div className="bg-muted h-4 w-2/3 rounded" />
      <div className="bg-muted mt-8 h-64 rounded-xl" />
    </div>
  );
}
