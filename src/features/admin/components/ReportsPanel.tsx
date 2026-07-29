import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeDate } from '@/features/creator/utils/creator.utils';
import type { AdminReport } from '@/types';

function statusVariant(status: AdminReport['status']) {
  switch (status) {
    case 'ready':
      return 'success' as const;
    case 'generating':
      return 'warning' as const;
    default:
      return 'destructive' as const;
  }
}

export function ReportsPanel({ reports }: { reports: AdminReport[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <p className="font-medium">{report.title}</p>
                <p className="text-muted-foreground text-xs">
                  {report.type} · {formatRelativeDate(report.createdAt)}
                </p>
              </div>
              <Badge variant={statusVariant(report.status)}>{report.status}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
