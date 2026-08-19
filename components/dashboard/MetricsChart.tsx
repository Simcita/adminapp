"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import type { MetricsHistoryItem } from "@/lib/types";

interface MetricsChartProps {
  data: MetricsHistoryItem[];
}

function format_time(iso: string) {
  return new Date(iso).toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function MetricsChart({ data }: MetricsChartProps) {
  if (data.length < 2) {
    return (
      <div className="border rounded-lg p-6 flex items-center justify-center h-48">
        <p className="text-sm text-muted-foreground">
          Not enough history yet — chart populates after 2+ metric snapshots.
        </p>
      </div>
    );
  }

  const chart_data = data.map((item) => ({
    time: format_time(item.createdAt),
    Submissions: item.totalSubmissions,
    Verified: item.successfulVerifications,
    "Pending Jobs": item.pendingJobs,
  }));

  return (
    <div className="border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-4 text-foreground">
        Activity Trend — last {data.length} snapshots
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chart_data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="Submissions"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Verified"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Pending Jobs"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
