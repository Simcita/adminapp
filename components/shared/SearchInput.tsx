"use client";

/**
 * SearchInput — Client Component
 * --------------------------------
 * Debounced text input that writes ?search= to the URL.
 * The 400ms debounce avoids a server request on every keystroke.
 *
 * Usage:
 *   <SearchInput placeholder="Search by email or account…" />
 */

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  placeholder?: string;
}

export default function SearchInput({
  placeholder = "Search…",
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const search_params = useSearchParams();

  const [value, set_value] = useState(
    () => search_params.get("search") ?? ""
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(search_params.toString());

      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }

      // Reset to page 1 whenever the search changes
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Input
      type="search"
      placeholder={placeholder}
      value={value}
      onChange={(e) => set_value(e.target.value)}
      className="w-56"
    />
  );
}
