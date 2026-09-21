"use server";

import { server_fetch } from "@/lib/api";
import type { BulkEmailRecipient, BulkEmailResult, EmailContact } from "@/lib/types";

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

/**
 * add_email_contact_action()
 * -----------------------------
 * Persists a manually-typed name/email into the Email Center's
 * contacts table (upsert — re-adding an existing email just
 * updates its name). This is what makes a manual recipient a
 * real, reusable database record instead of a value that only
 * ever existed inside one send request.
 */
export async function add_email_contact_action(
  name: string,
  email: string
): Promise<
  | { success: true; contact: EmailContact }
  | { success: false; message: string }
> {
  try {
    const res = await server_fetch<{ success: boolean; data: EmailContact }>(
      "/admin/contacts",
      { method: "POST", body: JSON.stringify({ name: name || undefined, email }) }
    );
    return { success: true, contact: res.data };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to add contact.",
    };
  }
}
