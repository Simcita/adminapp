/**
 * StatusBadge — Server Component
 * --------------------------------
 * Color-coded badge for submission status, job status,
 * notification channel, and parsing status.
 *
 * Usage:
 *   <StatusBadge value="VERIFIED" />
 *   <StatusBadge value="WHATSAPP" />
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  // Submission statuses
  VERIFIED:   "bg-green-100 text-green-800 border-green-200",
  PENDING:    "bg-yellow-100 text-yellow-800 border-yellow-200",
  FAILED:     "bg-red-100 text-red-800 border-red-200",
  DUPLICATE:  "bg-gray-100 text-gray-600 border-gray-200",

  // Job statuses
  COMPLETED:  "bg-green-100 text-green-800 border-green-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",

  // Channels
  WHATSAPP:   "bg-emerald-100 text-emerald-800 border-emerald-200",
  EMAIL:      "bg-sky-100 text-sky-800 border-sky-200",

  // Parsing
  SUCCESS:    "bg-green-100 text-green-800 border-green-200",

  // Waitlist statuses
  SENT:       "bg-green-100 text-green-800 border-green-200",
};

interface StatusBadgeProps {
  value: string;
  className?: string;
}

export default function StatusBadge({ value, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[value] ?? "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", style, className)}
    >
      {value}
    </Badge>
  );
}
