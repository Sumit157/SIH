'use client';

import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface TraitsChartProps {
  data: { name: string; value: number }[];
  unit: string;
}

const chartConfig = {
    value: {
        label: "Value",
        color: "hsl(var(--primary))",
    },
};

export function TraitsChart({ data, unit }: TraitsChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 10 }}>
        <XAxis type="number" dataKey="value" hide />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--foreground))' }}
          width={120}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          content={<ChartTooltipContent
            formatter={(value) => `${value} ${unit}`}
            indicator="dot"
           />}
        />
        <Bar dataKey="value" radius={4} fill="var(--color-value)" />
      </BarChart>
    </ChartContainer>
  );
}
