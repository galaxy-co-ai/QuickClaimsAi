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

// Design system inspired colors
const COLORS = [
  "#C4A77D", // sandstone (brand primary)
  "#B86B4C", // terracotta (brand secondary)
  "#2C2C2C", // charcoal
  "#A39171", // stone
  "#8B7355", // slate
  "#E8DFD0", // sand
  "#D4A574", // warm accent
  "#9B7B5C", // muted primary
  "#6B5B4C", // dark stone
  "#BFA88F", // light sandstone
  "#C69C6D", // golden sand
];

export function StatusChart({ data }: StatusChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--rr-color-stone)]">
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
            backgroundColor: "var(--rr-color-bg-secondary)",
            border: "1px solid var(--rr-color-border-default)",
            borderRadius: "var(--rr-radius-lg)",
            boxShadow: "var(--rr-shadow-md)",
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
