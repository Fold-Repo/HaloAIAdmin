import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatUsd } from '@/features/analytics/utils/analytics.utils';
import type { CreatorEarnings } from '@/types';

export function CreatorEarningsPanel({ earnings }: { earnings: CreatorEarnings }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gross earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatUsd(earnings.grossUsd)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Platform fee</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatUsd(earnings.platformFeeUsd)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatUsd(earnings.netUsd)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending payout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatUsd(earnings.payoutPendingUsd)}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Next payout {new Date(earnings.payoutNextDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Earnings breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {earnings.breakdown.map((item) => (
              <div key={item.source} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{item.source}</span>
                <span className="font-medium">{formatUsd(item.amountUsd)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
