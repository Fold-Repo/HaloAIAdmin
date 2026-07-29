import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type SectionShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
};

export function SectionShell({ title, description, children, action }: SectionShellProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

type InfoGridProps = {
  items: Array<{ label: string; value: ReactNode }>;
};

export function InfoGrid({ items }: InfoGridProps) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {item.label}
          </dt>
          <dd className="text-sm">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

type EntityCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function EntityCard({ title, subtitle, children }: EntityCardProps) {
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div>
        <p className="font-medium">{title}</p>
        {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
      </div>
      <div className="text-muted-foreground space-y-1 text-sm">{children}</div>
    </div>
  );
}

export function EmptySectionState({ message }: { message: string }) {
  return (
    <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-10 text-center text-sm">
      {message}
    </p>
  );
}
