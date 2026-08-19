"use client";

/**
 * Topbar — Client Component
 * --------------------------
 * Page-level header. Displays the title and a sign-out button.
 */

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  title: string;
  description?: string;
}

export default function Topbar({ title, description }: TopbarProps) {
  const [is_pending, start_transition] = useTransition();

  function handle_logout() {
    start_transition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    });
  }

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="font-semibold text-[15px] text-foreground">{title}</h1>
        {description && (
          <>
            <span className="text-border text-sm">·</span>
            <span className="text-muted-foreground text-sm">{description}</span>
          </>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handle_logout}
        disabled={is_pending}
        className="text-muted-foreground hover:text-foreground gap-2 text-sm h-8"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        {is_pending ? "Signing out…" : "Sign out"}
      </Button>
    </header>
  );
}
