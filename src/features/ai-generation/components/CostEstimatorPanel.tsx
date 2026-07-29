import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatUsd } from '@/features/ai-generation/utils/ai-generation.utils';
import type { CostEstimate } from '@/types';

export function CostEstimatorPanel({ estimate }: { estimate: CostEstimate }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost estimator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-left">
                  <th className="pb-2 font-medium">Agent</th>
                  <th className="pb-2 font-medium">Units</th>
                  <th className="pb-2 font-medium">Unit cost</th>
                  <th className="pb-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {estimate.items.map((item) => (
                  <tr key={item.agentId} className="border-b last:border-0">
                    <td className="py-3">{item.label}</td>
                    <td className="py-3">{item.units.toFixed(2)}</td>
                    <td className="py-3">{formatUsd(item.unitCostUsd)}</td>
                    <td className="py-3 font-medium">{formatUsd(item.totalUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatUsd(estimate.subtotalUsd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Buffer (15%)</span>
              <span>{formatUsd(estimate.bufferUsd)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Estimated total</span>
              <span>{formatUsd(estimate.totalUsd)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
