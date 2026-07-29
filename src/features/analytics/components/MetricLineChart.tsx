import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type MetricLineChartProps = {
  data: Array<{ date: string; value: number }>;
  valueFormatter?: (value: number) => string;
  color?: string;
};

export function MetricLineChart({
  data,
  valueFormatter = (value) => String(value),
  color = 'hsl(var(--primary))',
}: MetricLineChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(value: string) => value.slice(5)}
          />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={valueFormatter} width={48} />
          <Tooltip formatter={(value: number) => valueFormatter(value)} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
