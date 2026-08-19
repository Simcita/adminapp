"use server";

import { server_fetch } from "@/lib/api";

export async function check_account_action(account_id: string) {
  const res = await server_fetch<{ success: boolean; data: { found: boolean } }>(
    `/api/check-account?accountId=${encodeURIComponent(account_id)}`
  );
  return res.data.found;
}

export async function join_waitlist_action(form_data: FormData) {
  const payload = {
    name: form_data.get("name") as string,
    surname: form_data.get("surname") as string,
    email: form_data.get("email") as string,
    xmAccountId: form_data.get("xmAccountId") as string,
  };

  await server_fetch("/api/livestream-waitlist", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
