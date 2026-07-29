import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateCreatorStatus } from '@/features/admin/hooks/useAdminPortal';
import { CREATOR_STATUS_LABELS, formatNumber, formatUsd } from '@/features/admin/utils/admin.utils';
import { formatRelativeDate } from '@/features/creator/utils/creator.utils';
import type { AdminCreator, AdminCreatorStatus } from '@/types';

function statusVariant(status: AdminCreatorStatus) {
  switch (status) {
    case 'active':
      return 'success' as const;
    case 'review':
      return 'warning' as const;
    case 'suspended':
      return 'destructive' as const;
  }
}

export function CreatorManagementPanel({ creators }: { creators: AdminCreator[] }) {
  const updateStatus = useUpdateCreatorStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Creator management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left">
                <th className="pb-2 font-medium">Creator</th>
                <th className="pb-2 font-medium">Series</th>
                <th className="pb-2 font-medium">Subscribers</th>
                <th className="pb-2 font-medium">Revenue</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {creators.map((creator) => (
                <tr key={creator.id} className="border-b last:border-0">
                  <td className="py-3">
                    <p className="font-medium">{creator.name}</p>
                    <p className="text-muted-foreground text-xs">{creator.email}</p>
                  </td>
                  <td className="py-3">{creator.seriesCount}</td>
                  <td className="py-3">{formatNumber(creator.subscriberCount)}</td>
                  <td className="py-3">{formatUsd(creator.revenueUsd)}</td>
                  <td className="py-3">
                    <Badge variant={statusVariant(creator.status)}>
                      {CREATOR_STATUS_LABELS[creator.status]}
                    </Badge>
                  </td>
                  <td className="py-3">
                    {creator.status === 'review' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updateStatus.isPending}
                        onClick={() =>
                          updateStatus.mutate({ creatorId: creator.id, status: 'active' })
                        }
                      >
                        Approve
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground mt-3 text-xs">
          Joined dates range from {formatRelativeDate(creators[0]?.joinedAt ?? new Date().toISOString())}
        </p>
      </CardContent>
    </Card>
  );
}
