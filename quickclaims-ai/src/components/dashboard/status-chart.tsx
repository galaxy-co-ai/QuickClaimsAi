"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface StatusChartData {
  status: string;
  count: number;
}

interface StatusChartProps {
  data: StatusChartData[];
}

const COLORS = [
  "#3b82f6", // blue
  "#eab308", // yellow
  "#8b5cf6", // purple
  "#6366f1", // indigo
  "#06b6d4", // cyan
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#10b981", // emerald
];

export function StatusChart({ data }: StatusChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="status"
          tick={{ fontSize: 12 }}
          width={95}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          formatter={(value) => [value + " claims", "Count"]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={"cell-" + index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
