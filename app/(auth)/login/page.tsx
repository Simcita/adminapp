"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Suspense wrapper required because useSearchParams() suspends during SSG
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const search_params = useSearchParams();
  const redirect_to = search_params.get("redirect") ?? "/dashboard";

  const [email, set_email] = useState("");
  const [password, set_password] = useState("");
  const [error, set_error] = useState<string | null>(null);
  const [loading, set_loading] = useState(false);

  async function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    set_loading(true);
    set_error(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        set_error(data.message ?? "Login failed.");
        return;
      }

      router.push(redirect_to);
    } catch {
      set_error("Something went wrong. Please try again.");
    } finally {
      set_loading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-bold">MT</span>
          </div>
          <div>
            <p className="text-white font-semibold text-base leading-none">Modern Trader</p>
            <p className="text-white/50 text-xs mt-1">Affiliate Management System</p>
          </div>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-6">
          {[
            { icon: "📊", title: "Live Metrics", desc: "Real-time overview of submissions and verifications" },
            { icon: "⚡", title: "Instant Notifications", desc: "Automated email and WhatsApp delivery via fulfillment queue" },
            { icon: "🔒", title: "Audit Trail", desc: "Every admin action logged and immutable" },
          ].map((f) => (
            <div key={f.title} className="flex gap-4 items-start">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="text-white font-medium text-sm">{f.title}</p>
                <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-white/30 text-xs relative z-10">
          © {new Date().getFullYear()} Modern Trader. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">MT</span>
            </div>
            <span className="font-semibold text-lg">Modern Trader</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Sign in to your admin account to continue
            </p>
          </div>

          <form onSubmit={handle_submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => set_email(e.target.value)}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => set_password(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5">
                <svg className="h-4 w-4 text-destructive shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm text-destructive leading-relaxed">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-sm font-medium shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Access restricted to authorised administrators only
          </p>
        </div>
      </div>
    </div>
  );
}
