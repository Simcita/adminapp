"use server";

import { revalidatePath } from "next/cache";
import { server_fetch } from "@/lib/api";

export async function retry_job_action(job_id: string) {
  await server_fetch(`/admin/jobs/${job_id}/retry`, {
    method: "POST",
  });

  revalidatePath("/jobs");
  revalidatePath("/jobs/failed");
}
