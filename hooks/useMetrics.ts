"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { Metrics } from "@/lib/types";

type MetricsResponse = { success: boolean; data: { metrics: Metrics } };

export function useMetrics(initial: Metrics) {
  const { data } = useSWR<MetricsResponse>(
    "/api/proxy/admin/metrics",
    fetcher,
    {
      fallbackData: { success: true, data: { metrics: initial } },
      refreshInterval: 60_000,
      revalidateOnFocus: false,
    }
  );

  return data?.data?.metrics ?? initial;
}
