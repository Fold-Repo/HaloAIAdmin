import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils';

type QueryErrorProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export function QueryError({
  title = 'Something went wrong',
  message = 'Unable to load this content. Please try again.',
  onRetry,
  className,
}: QueryErrorProps) {
  return (
    <div
      className={cn(
        'border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center rounded-xl border px-6 py-12 text-center',
        className,
      )}
      role="alert"
    >
      <AlertCircle className="text-destructive mb-3 size-8" aria-hidden="true" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-md text-sm">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
