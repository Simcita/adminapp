"use client";

/**
 * RetryJobButton — Client Component
 * ------------------------------------
 * Calls the retry_job Server Action via useTransition.
 * Shows a pending state while the action is in-flight and
 * displays a toast on success or failure.
 *
 * Usage:
 *   <RetryJobButton job_id={job.id} />
 */

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { retry_job_action } from "@/actions/job.actions";

interface RetryJobButtonProps {
  job_id: string;
}

export default function RetryJobButton({ job_id }: RetryJobButtonProps) {
  const [is_pending, start_transition] = useTransition();

  function handle_retry() {
    start_transition(async () => {
      try {
        await retry_job_action(job_id);
        toast.success("Job reset to PENDING — worker will retry shortly.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to retry job."
        );
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handle_retry}
      disabled={is_pending}
    >
      {is_pending ? "Retrying…" : "Retry"}
    </Button>
  );
}
