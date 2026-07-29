import { KeyRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DEMO_ACCOUNTS } from '@/features/authentication/constants/demo-accounts';

type DemoLoginPanelProps = {
  onUseAccount: (email: string, password: string) => void;
};

export function DemoLoginPanel({ onUseAccount }: DemoLoginPanelProps) {
  return (
    <div className="bg-muted/50 space-y-3 rounded-lg border p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <KeyRound className="size-4" aria-hidden="true" />
        Demo accounts
      </div>
      <ul className="space-y-2 text-sm">
        {DEMO_ACCOUNTS.map((account) => (
          <li
            key={account.email}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="text-muted-foreground">
              <span className="text-foreground font-medium">{account.label}:</span>{' '}
              <code className="text-xs">{account.email}</code>
              <span className="mx-1">/</span>
              <code className="text-xs">{account.password}</code>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => onUseAccount(account.email, account.password)}
            >
              Use {account.label.toLowerCase()}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
