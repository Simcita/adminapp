/**
 * Templates Page — Server Component
 * ------------------------------------
 * Lists all notification templates (email + WhatsApp).
 * Includes a Create Template dialog and Toggle actions.
 */

import { server_fetch } from "@/lib/api";
import Topbar from "@/components/layout/Topbar";
import TemplateTable from "@/components/templates/TemplateTable";
import type { NotificationTemplate } from "@/lib/types";

// Backend returns { success, data: { templates: [...] } }
type TemplatesResponse = {
  success: boolean;
  data: { templates: NotificationTemplate[] };
};

export default async function TemplatesPage() {
  const res = await server_fetch<TemplatesResponse>("/admin/templates", {
    cache: "no-store",
  });

  return (
    <div>
      <Topbar title="Templates" />
      <div className="p-6">
        <TemplateTable templates={res.data.templates} />
      </div>
    </div>
  );
}
