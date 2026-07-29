import { zodResolver } from '@hookform/resolvers/zod';
import { Download } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExportReport } from '@/features/analytics/hooks/useAnalytics';
import {
  exportReportSchema,
  type ExportReportFormValues,
} from '@/features/analytics/schemas/analytics.schemas';
import { ANALYTICS_SECTIONS } from '@/features/analytics/utils/analytics.utils';
import type { AnalyticsSection } from '@/types';

const EXPORT_SECTIONS = ANALYTICS_SECTIONS.filter((section) => section.id !== 'export');

type ExportReportsPanelProps = {
  projectId: string;
};

export function ExportReportsPanel({ projectId }: ExportReportsPanelProps) {
  const exportReport = useExportReport(projectId);

  const form = useForm<ExportReportFormValues>({
    resolver: zodResolver(exportReportSchema),
    defaultValues: {
      format: 'csv',
      sections: ['dashboard', 'revenue', 'earnings'],
      dateFrom: '',
      dateTo: '',
    },
  });

  const selectedSections = form.watch('sections');

  const toggleSection = (section: AnalyticsSection, checked: boolean) => {
    const current = form.getValues('sections');
    form.setValue(
      'sections',
      checked ? [...current, section] : current.filter((item) => item !== section),
      { shouldValidate: true },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Export reports</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((values) => exportReport.mutate(values))}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <select
                id="format"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                {...form.register('format')}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From</Label>
              <Input id="dateFrom" type="date" {...form.register('dateFrom')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To</Label>
              <Input id="dateTo" type="date" {...form.register('dateTo')} />
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium">Sections</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {EXPORT_SECTIONS.map((section) => (
                <label
                  key={section.id}
                  className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                >
                  <Checkbox
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={(value) => toggleSection(section.id, value === true)}
                  />
                  {section.label}
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={exportReport.isPending}>
            <Download className="size-4" />
            {exportReport.isPending ? 'Generating...' : 'Export report'}
          </Button>

          {exportReport.data && (
            <div className="bg-muted rounded-md p-3 text-sm">
              <p>Report ready: {exportReport.data.data.reportId}</p>
              <a
                className="text-primary mt-1 inline-block underline"
                href={exportReport.data.data.downloadUrl}
              >
                Download ({exportReport.data.data.downloadUrl.split('.').pop()})
              </a>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
