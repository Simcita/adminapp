/**
 * Campaigns Page — Server Component
 * ------------------------------------
 * Lists all campaigns. Includes a Create Campaign form
 * in a dialog and inline Toggle/Edit/Delete actions.
 * Uses cache: "no-store" so mutations are always reflected.
 */

import { server_fetch } from "@/lib/api";
import Topbar from "@/components/layout/Topbar";
import CampaignTable from "@/components/campaigns/CampaignTable";
import type { Campaign } from "@/lib/types";

// Backend returns { success, data: { campaigns: [...] } }
type CampaignsResponse = {
  success: boolean;
  data: { campaigns: Campaign[] };
};

export default async function CampaignsPage() {
  const res = await server_fetch<CampaignsResponse>("/admin/campaigns", {
    cache: "no-store",
  });

  return (
    <div>
      <Topbar title="Campaigns" />
      <div className="p-6">
        <CampaignTable campaigns={res.data.campaigns} />
      </div>
    </div>
  );
}
