import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type MetricBarChartProps<T extends Record<string, string | number>> = {
  data: T[];
  bars: Array<{ dataKey: keyof T & string; fill: string; name: string }>;
  xKey: keyof T & string;
};

export function MetricBarChart<T extends Record<string, string | number>>({
  data,
  bars,
  xKey,
}: MetricBarChartProps<T>) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} tickFormatter={(value: string) => value.slice(5)} />
          <YAxis tick={{ fontSize: 11 }} width={48} />
          <Tooltip />
          <Legend />
          {bars.map((bar) => (
            <Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.fill} name={bar.name} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
