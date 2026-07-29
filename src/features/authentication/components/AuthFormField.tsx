import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/utils';

type AuthFormFieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function AuthFormField({ id, label, error, children, className }: AuthFormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthErrorAlert({ message }: { message: string }) {
  return (
    <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm" role="alert">
      {message}
    </p>
  );
}
