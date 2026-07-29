import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, formatUsd } from '@/features/admin/utils/admin.utils';
import type { CoinEconomyMetrics } from '@/types';

export function CoinEconomyPanel({ metrics }: { metrics: CoinEconomyMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In circulation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(metrics.coinsInCirculation)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Purchases (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(metrics.purchases24h)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unlocks (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(metrics.unlocks24h)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatUsd(metrics.revenueUsd)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top coin packages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.topPackages.map((pkg) => (
            <div key={pkg.label} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{pkg.label}</p>
                <p className="text-muted-foreground text-xs">{formatNumber(pkg.sales)} sales</p>
              </div>
              <span className="font-medium">{formatUsd(pkg.revenueUsd)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
