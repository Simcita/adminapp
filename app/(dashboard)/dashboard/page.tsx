import { server_fetch } from "@/lib/api";
import LiveMetricsGrid from "@/components/dashboard/LiveMetricsGrid";
import MetricsChart from "@/components/dashboard/MetricsChart";
import Topbar from "@/components/layout/Topbar";
import type { Metrics, MetricsHistoryItem } from "@/lib/types";

type MetricsResponse = {
  success: boolean;
  data: { metrics: Metrics };
};

type HistoryResponse = {
  success: boolean;
  data: MetricsHistoryItem[];
};

export default async function DashboardPage() {
  const [metrics_res, history_res] = await Promise.all([
    server_fetch<MetricsResponse>("/admin/metrics", {
      next: { revalidate: 60, tags: ["metrics"] },
    }),
    server_fetch<HistoryResponse>("/admin/metrics/history?limit=24", {
      next: { revalidate: 900, tags: ["metrics-history"] },
    }),
  ]);

  const now = new Date().toLocaleDateString("en-ZA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div>
      <Topbar title="Dashboard" />

      <div className="p-6 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">System Overview</h2>
            <p className="text-sm text-muted-foreground mt-1">{now}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live — auto-refreshes every 60s
          </div>
        </div>

        <LiveMetricsGrid initial={metrics_res.data.metrics} />

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Historical Trend</h3>
          <MetricsChart data={history_res.data} />
        </div>
      </div>
    </div>
  );
}
