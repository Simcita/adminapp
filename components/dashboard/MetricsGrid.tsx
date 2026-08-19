/**
 * MetricsGrid — Server Component
 * --------------------------------
 * Renders a responsive grid of KPI stat cards.
 */

import type { Metrics } from "@/lib/types";

type Accent = "indigo" | "green" | "amber" | "red" | "sky" | "violet";

const ACCENT_CLASSES: Record<Accent, { bg: string; num: string; icon: string }> = {
  indigo: { bg: "bg-indigo-50 border-indigo-100",  num: "text-indigo-700",  icon: "bg-indigo-100 text-indigo-600" },
  green:  { bg: "bg-emerald-50 border-emerald-100", num: "text-emerald-700", icon: "bg-emerald-100 text-emerald-600" },
  amber:  { bg: "bg-amber-50 border-amber-100",     num: "text-amber-700",   icon: "bg-amber-100 text-amber-600" },
  red:    { bg: "bg-red-50 border-red-100",         num: "text-red-700",     icon: "bg-red-100 text-red-600" },
  sky:    { bg: "bg-sky-50 border-sky-100",         num: "text-sky-700",     icon: "bg-sky-100 text-sky-600" },
  violet: { bg: "bg-violet-50 border-violet-100",   num: "text-violet-700",  icon: "bg-violet-100 text-violet-600" },
};

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  accent: Accent;
  icon: React.ReactNode;
}

function StatCard({ title, value, description, accent, icon }: StatCardProps) {
  const cls = ACCENT_CLASSES[accent];
  return (
    <div className={`rounded-xl border p-5 ${cls.bg}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
        <span className={`h-8 w-8 rounded-lg flex items-center justify-center ${cls.icon}`}>
          {icon}
        </span>
      </div>
      <p className={`text-3xl font-bold tabular-nums ${cls.num}`}>
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-muted-foreground mt-1.5">{description}</p>
    </div>
  );
}

const ICONS = {
  submissions: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  verified: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  failed: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  pending: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  completed: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  parser: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  jobs_failed: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

export default function MetricsGrid({ metrics }: { metrics: Metrics }) {
  const cards: StatCardProps[] = [
    {
      title: "Total Submissions",
      value: metrics.totalSubmissions,
      description: "All-time verification form submissions",
      accent: "indigo",
      icon: ICONS.submissions,
    },
    {
      title: "Verified Accounts",
      value: metrics.successfulVerifications,
      description: "Successfully verified XM accounts",
      accent: "green",
      icon: ICONS.verified,
    },
    {
      title: "Failed Verifications",
      value: metrics.failedVerifications,
      description: "Submissions that could not be verified",
      accent: "red",
      icon: ICONS.failed,
    },
    {
      title: "Pending Jobs",
      value: metrics.pendingJobs,
      description: "Notifications queued for delivery",
      accent: "amber",
      icon: ICONS.pending,
    },
    {
      title: "Completed Jobs",
      value: metrics.completedJobs,
      description: "Notifications delivered successfully",
      accent: "sky",
      icon: ICONS.completed,
    },
    {
      title: "Failed Jobs",
      value: metrics.failedJobs,
      description: "Dead-letter queue entries",
      accent: "red",
      icon: ICONS.jobs_failed,
    },
    {
      title: "Parser Failures",
      value: metrics.parserFailures,
      description: "Emails where extraction failed",
      accent: "violet",
      icon: ICONS.parser,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
