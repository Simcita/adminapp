"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { server_fetch } from "@/lib/api";

export async function create_campaign_action(form_data: FormData) {
  const payload = {
    campaignName: form_data.get("campaignName") as string,
    brokerName:   form_data.get("brokerName") as string,
    whopLink:     form_data.get("whopLink") as string,
    isActive:     form_data.get("isActive") !== "false",
  };

  await server_fetch("/admin/campaigns", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  revalidatePath("/campaigns");
  redirect("/campaigns");
}

export async function update_campaign_action(
  campaign_id: string,
  form_data: FormData
) {
  const payload: Record<string, unknown> = {};

  const name   = form_data.get("campaignName") as string;
  const broker = form_data.get("brokerName") as string;
  const link   = form_data.get("whopLink") as string;

  if (name)   payload.campaignName = name;
  if (broker) payload.brokerName   = broker;
  if (link)   payload.whopLink     = link;

  await server_fetch(`/admin/campaigns/${campaign_id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  revalidatePath("/campaigns");
}

export async function toggle_campaign_action(campaign_id: string) {
  await server_fetch(`/admin/campaigns/${campaign_id}/toggle`, {
    method: "PATCH",
  });

  revalidatePath("/campaigns");
}

export async function delete_campaign_action(campaign_id: string) {
  await server_fetch(`/admin/campaigns/${campaign_id}`, {
    method: "DELETE",
  });

  revalidatePath("/campaigns");
  redirect("/campaigns");
}
