"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { join_waitlist_action } from "@/actions/public.actions";

export default function WaitlistSignupPage() {
  const [submitted, set_submitted] = useState(false);
  const [submitting, set_submitting] = useState(false);
  const [error, set_error] = useState<string | null>(null);

  async function handle_submit(form_data: FormData) {
    set_submitting(true);
    set_error(null);

    const result = await join_waitlist_action(form_data);
    if (result.success) {
      set_submitted(true);
    } else {
      set_error(result.message);
    }
    set_submitting(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-green-600 text-white text-center px-6">
        <div>
          <p className="text-5xl font-bold mb-3">Thank you for registering</p>
          <p className="text-xl text-white/90">
            We will send the link via email when the stream begins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center text-foreground">
          Livestream Waitlist
        </h1>

        <form action={handle_submit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-base">First name</Label>
            <Input id="name" name="name" required className="h-14 text-lg" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="surname" className="text-base">Last name</Label>
            <Input id="surname" name="surname" required className="h-14 text-lg" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-base">Email</Label>
            <Input id="email" name="email" type="email" required className="h-14 text-lg" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="xmAccountId" className="text-base">MT ID</Label>
            <Input id="xmAccountId" name="xmAccountId" required className="h-14 text-lg" />
          </div>

          {error && (
            <p className="text-center text-base text-destructive whitespace-pre-line">{error}</p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-16 text-xl"
          >
            {submitting ? "Joining…" : "Join waitlist"}
          </Button>
        </form>
      </div>
    </div>
  );
}
