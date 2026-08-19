"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { check_account_action } from "@/actions/public.actions";

type Result = "found" | "not-found" | null;

export default function CheckAccountPage() {
  const [account_id, set_account_id] = useState("");
  const [result, set_result] = useState<Result>(null);
  const [checking, set_checking] = useState(false);
  const [error, set_error] = useState<string | null>(null);

  async function handle_check(e: React.FormEvent) {
    e.preventDefault();
    if (!account_id.trim()) return;

    set_checking(true);
    set_error(null);
    set_result(null);

    const res = await check_account_action(account_id.trim());
    if ("error" in res) {
      set_error(res.error);
    } else {
      set_result(res.found ? "found" : "not-found");
    }
    set_checking(false);
  }

  function reset() {
    set_result(null);
    set_account_id("");
    set_error(null);
  }

  if (result === "found") {
    return (
      <StatusScreen
        tone="green"
        message="Registered"
        onTap={reset}
      />
    );
  }

  if (result === "not-found") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-red-600 text-white text-center px-6 gap-6">
        <p className="text-6xl font-bold">Not found</p>
        <div className="max-w-sm space-y-2">
          <p className="text-xl">
            Open a live account with partner code{" "}
            <span className="font-bold">UNITOUR</span>
          </p>
          <a
            href="https://clicks.pipaffiliates.com/c?c=1264888&l=en&p=1"
            target="_blank"
            rel="noreferrer"
            className="block text-lg underline underline-offset-4 break-all"
          >
            https://clicks.pipaffiliates.com/c?c=1264888&l=en&p=1
          </a>
        </div>
        <Button
          variant="outline"
          onClick={reset}
          className="h-14 px-8 text-lg text-white bg-transparent border-white hover:bg-white/10 hover:text-white"
        >
          Check another ID
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center text-foreground">
          Door Check
        </h1>

        <form onSubmit={handle_check} className="space-y-4">
          <Input
            autoFocus
            inputMode="text"
            placeholder="MT ID"
            value={account_id}
            onChange={(e) => set_account_id(e.target.value)}
            className="h-16 text-2xl text-center"
          />

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            disabled={checking || !account_id.trim()}
            className="w-full h-16 text-xl"
          >
            {checking ? "Checking…" : "Check"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function StatusScreen({
  tone,
  message,
  onTap,
}: {
  tone: "green" | "red";
  message: string;
  onTap: () => void;
}) {
  return (
    <button
      onClick={onTap}
      className={
        "min-h-screen w-full flex items-center justify-center text-white text-6xl font-bold text-center px-6 " +
        (tone === "green" ? "bg-green-600" : "bg-red-600")
      }
    >
      {message}
    </button>
  );
}
