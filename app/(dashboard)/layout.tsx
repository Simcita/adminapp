/**
 * Dashboard Route Group Layout — Server Component
 * -------------------------------------------------
 * Wraps all protected pages with the shared sidebar shell.
 */

import Sidebar from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>

      <Toaster richColors position="top-right" closeButton />
    </div>
  );
}
