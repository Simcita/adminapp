"use server";

import { server_fetch } from "@/lib/api";
import type { BulkEmailRecipient, BulkEmailResult } from "@/lib/types";

export async function send_bulk_email_action(
  recipients: BulkEmailRecipient[],
  form_data: FormData
): Promise<
  | ({ success: true } & BulkEmailResult)
  | { success: false; message: string }
> {
  const payload = {
    recipients,
    subject: form_data.get("subject") as string,
    body: form_data.get("body") as string,
  };

  try {
    const res = await server_fetch<{ success: boolean; data: BulkEmailResult }>(
      "/admin/emails/send-bulk",
      { method: "POST", body: JSON.stringify(payload) }
    );
    return { success: true, ...res.data };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to send emails.",
    };
  }
}
