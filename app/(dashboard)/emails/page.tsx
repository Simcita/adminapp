import { server_fetch } from "@/lib/api";
import Topbar from "@/components/layout/Topbar";
import EmailComposer from "@/components/emails/EmailComposer";
import type { NotificationTemplate, PaginatedResponse } from "@/lib/types";

// Bulk sends are chunked and paced sequentially against Resend's rate
// limit (~15-20s for a few hundred recipients, same reasoning as the
// waitlist bulk-send) — give this route's functions more room than
// the platform default.
export const maxDuration = 60;

export default async function EmailsPage() {
  const templates_res = await server_fetch<PaginatedResponse<NotificationTemplate>>(
    "/admin/templates?limit=100",
    { cache: "no-store" }
  );

  const email_templates = templates_res.data.filter(
    (t) => t.notificationType === "EMAIL" && t.isActive
  );

  return (
    <div>
      <Topbar
        title="Email Center"
        description="Compose and send an email to multiple people at once"
      />
      <div className="p-6">
        <EmailComposer templates={email_templates} />
      </div>
    </div>
  );
}
