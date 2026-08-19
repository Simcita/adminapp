"use server";

import { server_fetch } from "@/lib/api";

export async function check_account_action(
  account_id: string
): Promise<{ found: boolean } | { error: string }> {
  try {
    const res = await server_fetch<{ success: boolean; data: { found: boolean } }>(
      `/api/check-account?accountId=${encodeURIComponent(account_id)}`
    );
    return { found: res.data.found };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Something went wrong. Please try again.",
    };
  }
}

export async function join_waitlist_action(
  form_data: FormData
): Promise<{ success: true } | { success: false; message: string }> {
  const payload = {
    name: form_data.get("name") as string,
    surname: form_data.get("surname") as string,
    email: form_data.get("email") as string,
    xmAccountId: form_data.get("xmAccountId") as string,
  };

  try {
    await server_fetch("/api/livestream-waitlist", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { success: true };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Something went wrong. Please try again.",
    };
  }
}
