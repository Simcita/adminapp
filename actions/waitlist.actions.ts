"use server";

import { revalidatePath } from "next/cache";
import { server_fetch } from "@/lib/api";

export async function add_waitlist_entry_action(
  form_data: FormData
): Promise<{ success: true } | { success: false; message: string }> {
  const payload = {
    name: form_data.get("name") as string,
    surname: form_data.get("surname") as string,
    email: form_data.get("email") as string,
    xmAccountId: form_data.get("xmAccountId") as string,
  };

  try {
    await server_fetch("/admin/waitlist", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    revalidatePath("/waitlist");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to add to waitlist.",
    };
  }
}

export async function send_waitlist_links_action(form_data: FormData): Promise<
  | { success: true; sent: number; failed: number; failedEmails: string[] }
  | { success: false; message: string }
> {
  const payload = {
    subject: form_data.get("subject") as string,
    body: form_data.get("body") as string,
  };

  try {
    const res = await server_fetch<{
      success: boolean;
      data: { sent: number; failed: number; failedEmails: string[] };
    }>("/admin/waitlist/send-links", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    revalidatePath("/waitlist");
    return { success: true, ...res.data };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to send links.",
    };
  }
}

export async function send_single_waitlist_link_action(
  entry_id: string,
  form_data: FormData
): Promise<{ success: true } | { success: false; message: string }> {
  const payload = {
    subject: form_data.get("subject") as string,
    body: form_data.get("body") as string,
  };

  try {
    await server_fetch(`/admin/waitlist/${entry_id}/send-link`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    revalidatePath("/waitlist");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to send link.",
    };
  }
}
