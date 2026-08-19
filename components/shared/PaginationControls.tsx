"use client";

/**
 * PaginationControls — Client Component
 * ----------------------------------------
 * Previous / Next buttons that update the ?page= URL param.
 * Pages are driven by URL state — no client-side data storage.
 * Changing the page triggers a server re-render of the parent
 * Server Component with fresh data from the backend.
 *
 * Usage:
 *   <PaginationControls meta={meta} />
 */

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/lib/types";

interface PaginationControlsProps {
  meta: PaginationMeta;
}

export default function PaginationControls({ meta }: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const search_params = useSearchParams();

  function go_to_page(page: number) {
    const params = new URLSearchParams(search_params.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  const { page, total_pages, total, limit } = meta;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
      <span>
        {start}–{end} of {total}
      </span>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => go_to_page(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>

        <span className="flex items-center px-2 text-xs">
          Page {page} / {total_pages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => go_to_page(page + 1)}
          disabled={page >= total_pages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
