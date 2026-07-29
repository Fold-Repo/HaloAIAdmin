import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, formatPercent } from '@/features/analytics/utils/analytics.utils';
import type { CohortAnalysis } from '@/types';

export function CohortAnalysisPanel({ analysis }: { analysis: CohortAnalysis }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cohort analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left">
                <th className="pb-2 font-medium">Cohort</th>
                <th className="pb-2 font-medium">Size</th>
                <th className="pb-2 font-medium">W0</th>
                <th className="pb-2 font-medium">W1</th>
                <th className="pb-2 font-medium">W2</th>
                <th className="pb-2 font-medium">W3</th>
                <th className="pb-2 font-medium">W4</th>
              </tr>
            </thead>
            <tbody>
              {analysis.cohorts.map((row) => (
                <tr key={row.cohort} className="border-b last:border-0">
                  <td className="py-3 font-medium">{row.cohort}</td>
                  <td className="py-3">{formatNumber(row.size)}</td>
                  {[row.week0, row.week1, row.week2, row.week3, row.week4].map((value, index) => (
                    <td key={`${row.cohort}-${index}`} className="py-3">
                      <span
                        className="inline-flex min-w-12 justify-center rounded px-2 py-1 text-xs"
                        style={{
                          backgroundColor: `color-mix(in oklab, hsl(var(--primary)) ${value}%, transparent)`,
                        }}
                      >
                        {formatPercent(value, 0)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
