import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  formatNumber,
  formatUsd,
  HEALTH_LABELS,
} from '@/features/admin/utils/admin.utils';
import type { AdminOverview } from '@/types';

function healthVariant(health: AdminOverview['systemHealth']) {
  switch (health) {
    case 'healthy':
      return 'success' as const;
    case 'degraded':
      return 'warning' as const;
    case 'critical':
      return 'destructive' as const;
  }
}

export function AdminOverviewPanel({ overview }: { overview: AdminOverview }) {
  const cards = [
    { label: 'Total users', value: formatNumber(overview.totalUsers) },
    { label: 'Creators', value: formatNumber(overview.totalCreators) },
    { label: 'Pending moderation', value: formatNumber(overview.pendingModeration) },
    { label: 'AI spend', value: formatUsd(overview.aiSpendUsd) },
    { label: 'Active subscriptions', value: formatNumber(overview.activeSubscriptions) },
    { label: 'Coin tx (24h)', value: formatNumber(overview.coinTransactions24h) },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">System health</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={healthVariant(overview.systemHealth)}>
            {HEALTH_LABELS[overview.systemHealth]}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
