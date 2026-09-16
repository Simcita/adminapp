"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { send_bulk_email_action } from "@/actions/email.actions";
import type {
  BulkEmailRecipient,
  NotificationTemplate,
  PaginatedResponse,
  UserSubmission,
  XmApprovedAccount,
  LivestreamWaitlistEntry,
} from "@/lib/types";

const MAX_RECIPIENTS = 1000;

type RecipientSource = "submissions" | "accounts" | "waitlist";

const SOURCE_LABELS: Record<RecipientSource, string> = {
  submissions: "Submissions",
  accounts: "XM Accounts",
  waitlist: "Waitlist",
};

interface EmailComposerProps {
  templates: NotificationTemplate[];
}

/**
 * parse_recipients()
 * -------------------
 * Turns the free-form recipients textarea into a deduplicated
 * list of { email, name }. Accepts one entry per line in any of:
 *   Name <email@x.com>
 *   email@x.com,Name
 *   email@x.com
 * Lines that don't contain a plausible email are skipped (and
 * counted, so the caller can tell the admin some lines were
 * dropped) rather than silently sent to nowhere.
 */
function parse_recipients(raw: string): { recipients: BulkEmailRecipient[]; skipped: number } {
  const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const seen = new Set<string>();
  const recipients: BulkEmailRecipient[] = [];
  let skipped = 0;

  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    let email = "";
    let name = "";

    const angle_match = line.match(/^(.*)<([^>]+)>$/);

    if (angle_match) {
      name = angle_match[1].trim().replace(/^"|"$/g, "");
      email = angle_match[2].trim();
    } else if (line.includes(",")) {
      const [first, ...rest] = line.split(",");
      const remainder = rest.join(",").trim();
      if (first.includes("@")) {
        email = first.trim();
        name = remainder;
      } else {
        email = remainder;
        name = first.trim();
      }
    } else {
      email = line;
    }

    if (!email_regex.test(email)) {
      skipped++;
      continue;
    }

    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    recipients.push(name ? { email, name } : { email });
  }

  return { recipients, skipped };
}

export default function EmailComposer({ templates }: EmailComposerProps) {
  const [subject, set_subject] = useState("");
  const [body, set_body] = useState("");
  const [recipients_raw, set_recipients_raw] = useState("");
  const [selected_template, set_selected_template] = useState("__none__");
  const [loading_source, set_loading_source] = useState<RecipientSource | null>(null);
  const [is_pending, start_transition] = useTransition();

  const { recipients, skipped } = useMemo(
    () => parse_recipients(recipients_raw),
    [recipients_raw]
  );

  function handle_template_change(value: string) {
    set_selected_template(value);

    if (value === "__none__") {
      return;
    }

    const template = templates.find((t) => t.id === value);
    if (!template) return;

    set_subject(template.subjectLine ?? "");
    set_body(template.templateBody);
  }

  async function load_from(source: RecipientSource) {
    set_loading_source(source);

    try {
      const res = await fetch(`/api/proxy/admin/${source}?limit=500`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load recipients.");
      }

      let lines: string[] = [];

      if (source === "submissions") {
        const data = json as PaginatedResponse<UserSubmission>;
        lines = data.data
          .filter((s) => s.email)
          .map((s) => `${s.email},${s.name} ${s.surname}`.trim());
      } else if (source === "accounts") {
        const data = json as PaginatedResponse<XmApprovedAccount>;
        lines = data.data
          .filter((a) => a.senderEmail)
          .map((a) => a.senderEmail as string);
      } else {
        const data = json as PaginatedResponse<LivestreamWaitlistEntry>;
        lines = data.data
          .filter((w) => w.email)
          .map((w) => `${w.email},${w.name} ${w.surname}`.trim());
      }

      if (lines.length === 0) {
        toast.error(`No recipients with an email found in ${SOURCE_LABELS[source]}.`);
        return;
      }

      set_recipients_raw((prev) => {
        const existing = prev.trim();
        const addition = lines.join("\n");
        return existing ? `${existing}\n${addition}` : addition;
      });

      toast.success(`Loaded ${lines.length} from ${SOURCE_LABELS[source]}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load recipients.");
    } finally {
      set_loading_source(null);
    }
  }

  function handle_send() {
    if (recipients.length === 0) {
      toast.error("Add at least one recipient first.");
      return;
    }

    if (recipients.length > MAX_RECIPIENTS) {
      toast.error(
        `Too many recipients (${recipients.length}). Send at most ${MAX_RECIPIENTS} at a time — split the rest into another send.`
      );
      return;
    }

    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and body are both required.");
      return;
    }

    if (
      !confirm(
        `Send this email to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"}? This cannot be undone.`
      )
    ) {
      return;
    }

    start_transition(async () => {
      const fd = new FormData();
      fd.set("subject", subject);
      fd.set("body", body);

      const result = await send_bulk_email_action(recipients, fd);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        `Sent: ${result.sent}, Failed: ${result.failed}${
          result.failedEmails.length > 0 ? ` (${result.failedEmails.join(", ")})` : ""
        }`
      );
    });
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recipients</h2>
          <span className="text-sm text-muted-foreground">
            {recipients.length} recipient{recipients.length === 1 ? "" : "s"}
            {skipped > 0 ? ` · ${skipped} line${skipped === 1 ? "" : "s"} skipped (invalid email)` : ""}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(SOURCE_LABELS) as RecipientSource[]).map((source) => (
            <Button
              key={source}
              type="button"
              variant="outline"
              size="sm"
              disabled={loading_source !== null}
              onClick={() => load_from(source)}
            >
              {loading_source === source ? "Loading…" : `Load from ${SOURCE_LABELS[source]}`}
            </Button>
          ))}
        </div>

        <div className="space-y-1">
          <Label htmlFor="recipients_raw">
            One per line — email, Name &lt;email&gt;, or email,Name. You can paste a
            list, use the buttons above to pull from existing records, or both — the
            same recipient is only sent to once.
          </Label>
          <textarea
            id="recipients_raw"
            value={recipients_raw}
            onChange={(e) => set_recipients_raw(e.target.value)}
            rows={8}
            placeholder={"jane@example.com,Jane Doe\njohn@example.com"}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y font-mono"
          />
        </div>
      </div>

      <div className="border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Compose</h2>
        </div>

        {templates.length > 0 && (
          <div className="space-y-1">
            <Label>Start from a template (optional)</Label>
            <Select value={selected_template} onValueChange={(v) => v && handle_template_change(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Start from scratch —</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.templateName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="email_subject">Subject</Label>
          <Input
            id="email_subject"
            value={subject}
            onChange={(e) => set_subject(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email_body">
            Body — sent exactly as written, only {"{{name}}"} is replaced per
            recipient (blank if a recipient has no name). Nothing is added
            automatically.
          </Label>
          <textarea
            id="email_body"
            value={body}
            onChange={(e) => set_body(e.target.value)}
            rows={10}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
          />
        </div>

        <Button onClick={handle_send} disabled={is_pending}>
          {is_pending
            ? "Sending…"
            : `Send to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"}`}
        </Button>
      </div>
    </div>
  );
}
