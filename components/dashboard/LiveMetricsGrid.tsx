"use client";

import { useMetrics } from "@/hooks/useMetrics";
import MetricsGrid from "./MetricsGrid";
import type { Metrics } from "@/lib/types";

export default function LiveMetricsGrid({ initial }: { initial: Metrics }) {
  const metrics = useMetrics(initial);
  return <MetricsGrid metrics={metrics} />;
}
