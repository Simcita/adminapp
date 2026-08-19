"use client";

/**
 * StatusFilter — Client Component
 * ---------------------------------
 * Dropdown that writes ?status= to the URL, triggering a
 * server re-render of the parent page with filtered data.
 *
 * Usage:
 *   <StatusFilter
 *     options={["PENDING", "VERIFIED", "FAILED", "DUPLICATE"]}
 *     placeholder="All statuses"
 *   />
 */

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusFilterProps {
  options: string[];
  param?: string;        // URL param name, default "status"
  placeholder?: string;
}

export default function StatusFilter({
  options,
  param = "status",
  placeholder = "All statuses",
}: StatusFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const search_params = useSearchParams();

  const current = search_params.get(param) ?? "ALL";

  function handle_change(value: string | null) {
    if (value === null) return;
    const params = new URLSearchParams(search_params.toString());

    if (value === "ALL") {
      params.delete(param);
    } else {
      params.set(param, value);
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={current} onValueChange={handle_change}>
      <SelectTrigger className="w-44">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="ALL">{placeholder}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
