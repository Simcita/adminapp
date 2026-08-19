# Modern Trader — Admin Dashboard

Internal admin interface for the Modern Trader affiliate verification system.
Built with **Next.js 16**, **shadcn/ui**, and **Tailwind CSS** using the App Router.

---

## What This System Does

Modern Trader automates the process of verifying XM trading accounts for affiliate partners:

1. **Affiliate emails arrive** in a Gmail inbox. A background IMAP worker polls every minute, extracts XM account IDs, and saves them to the database.
2. **Users submit a form** on the public webapp with their name, contact details, and XM account ID.
3. **A verification cron bot** runs every minute. It checks pending submissions against the approved account list. When a match is found, it marks the submission as VERIFIED.
4. **A fulfillment worker** picks up the verified submission and sends:
   - A **Resend email** with the Whop community link and access instructions.
   - A **WhatsApp message** via Bandile's Meta Business account.
5. **This admin dashboard** lets the team monitor everything — submissions, jobs, accounts, logs — and manage campaigns and templates, all without touching code.

---

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Admin sign-in. Credentials verified by the backend. |
| `/dashboard` | Live system metrics: submissions, verifications, jobs, parser failures. Refreshes every 60 seconds. |
| `/submissions` | All user verification form submissions. Filterable by status, searchable by name/email/account ID. |
| `/accounts` | XM account IDs extracted from affiliate emails. Shows whether each account has been claimed. |
| `/jobs` | Fulfillment notification queue (email + WhatsApp jobs). FAILED jobs can be retried inline. |
| `/jobs/failed` | Dead-letter queue — jobs that exhausted all 3 retry attempts. |
| `/campaigns` | Affiliate campaign management. Create, toggle, and delete campaigns with their Whop links. |
| `/templates` | Email and WhatsApp notification templates. |
| `/parser-logs` | Record of every email the Gmail IMAP worker processed. |
| `/audit-logs` | Immutable trail of all admin actions and system events. |

---

## Prerequisites

- **Node.js 20+**
- The **backend server** running — see `backendsystem/` folder
- All required backend `.env` variables set (see backend deployment guide)

---

## Setup

### 1. Install dependencies

```bash
cd admin
npm install
```

### 2. Configure environment

Create `.env.local` in the `admin/` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

In production:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 3. Run locally

```bash
npm run dev
# http://localhost:3000 → redirects to /login
```

### 4. Build for production

```bash
npm run build
npm start
```

---

## Authentication — How It Works

The backend (port 5000) and dashboard (port 3000) are different browser origins. The backend's HttpOnly cookie is set on port 5000, so the browser won't send it to port 3000 — Next.js middleware would never see it.

**The fix: a Route Handler proxy.**

```
Browser                   Next.js :3000            Express :5000
  │                            │                        │
  │  POST /api/auth/login      │                        │
  │───────────────────────────▶│                        │
  │                            │  POST /admin/auth/login│
  │                            │───────────────────────▶│
  │                            │  { data: {admin,token}}│
  │                            │◀───────────────────────│
  │  Set-Cookie on :3000 ✓     │                        │
  │◀───────────────────────────│                        │
  │                            │                        │
  │  GET /dashboard            │                        │
  │───────────────────────────▶│                        │
  │  middleware reads cookie ✓ │                        │
```

1. Login form calls `/api/auth/login` (same Next.js origin).
2. Route Handler (`app/api/auth/login/route.ts`) calls the Express backend.
3. Backend returns the JWT **in the response body** (`data.token`).
4. Route Handler sets an HttpOnly cookie on the **Next.js domain**.
5. Server Components use `lib/api.ts#server_fetch()` which reads that cookie and forwards it to every backend API call.

---

## Project Structure

```
admin/
├── .env.local                      ← NEXT_PUBLIC_API_URL
├── middleware.ts                   ← Edge auth guard
│
├── app/
│   ├── layout.tsx                  ← Root HTML shell, fonts
│   ├── page.tsx                    ← Redirects → /dashboard
│   ├── globals.css                 ← Tailwind v4 + shadcn CSS variables
│   │
│   ├── api/auth/
│   │   ├── login/route.ts          ← Route Handler: proxy login, set cookie
│   │   └── logout/route.ts         ← Route Handler: clear cookie, redirect
│   │
│   ├── (auth)/login/page.tsx       ← Public login form (Client Component)
│   │
│   └── (dashboard)/                ← Protected route group
│       ├── layout.tsx              ← Sidebar + Toaster
│       ├── dashboard/page.tsx      ← Metrics overview
│       ├── submissions/page.tsx    ← User submissions table
│       ├── accounts/page.tsx       ← XM approved accounts
│       ├── jobs/page.tsx           ← Fulfillment jobs
│       ├── jobs/failed/page.tsx    ← Dead-letter queue
│       ├── campaigns/page.tsx      ← Campaign management
│       ├── templates/page.tsx      ← Template management
│       ├── parser-logs/page.tsx    ← Gmail parser logs
│       └── audit-logs/page.tsx     ← Audit trail
│
├── components/
│   ├── ui/                         ← shadcn/ui auto-generated
│   ├── layout/
│   │   ├── Sidebar.tsx             ← Navigation (Server Component)
│   │   └── Topbar.tsx              ← Header + logout (Client Component)
│   ├── dashboard/MetricsGrid.tsx   ← Stat cards (Server Component)
│   ├── campaigns/CampaignTable.tsx ← Full CRUD UI (Client Component)
│   ├── templates/TemplateTable.tsx ← List + create dialog (Client Component)
│   ├── jobs/RetryJobButton.tsx     ← Inline retry (Client Component)
│   └── shared/
│       ├── StatusBadge.tsx         ← Color-coded badge (Server Component)
│       ├── PaginationControls.tsx  ← Prev/Next via URL params (Client Component)
│       ├── SearchInput.tsx         ← Debounced search → URL (Client Component)
│       └── StatusFilter.tsx        ← Dropdown filter → URL (Client Component)
│
├── lib/
│   ├── api.ts                      ← server_fetch<T>() authenticated fetch
│   ├── types.ts                    ← TypeScript types matching backend shapes
│   └── utils.ts                    ← cn() helper from shadcn
│
└── actions/
    ├── campaign.actions.ts         ← create, update, toggle, delete
    ├── template.actions.ts         ← create, update, toggle
    └── job.actions.ts              ← retry
```

---

## Code Patterns Explained

### Pattern 1: Server Components fetch data

Every read/list page is a Server Component. Data is fetched on the server before the page HTML is generated.

```tsx
// app/(dashboard)/submissions/page.tsx

// searchParams is a Promise in Next.js 15+ — must be awaited
export default async function SubmissionsPage({ searchParams }) {
  const params = await searchParams;
  const page   = params.page ?? "1";
  const status = params.status ?? "";

  const res = await server_fetch<PaginatedResponse<UserSubmission>>(
    `/admin/submissions?page=${page}&status=${status}`,
    { next: { revalidate: 30, tags: ["submissions"] } }  // cache 30s
  );

  return (
    <>
      <SubmissionsTable data={res.data} />
      <PaginationControls meta={res.meta} />
    </>
  );
}
```

**Benefit:** Zero loading spinners for initial page load. Data arrives with the HTML. Auth cookie is never exposed to the browser.

---

### Pattern 2: URL-as-state for filters and pagination

Client Components update URL query params. The Server Component page re-renders with new filtered data automatically.

```tsx
// User types in SearchInput → URL becomes /submissions?search=john&page=1
// Next.js re-renders SubmissionsPage with new searchParams → fresh data from backend

// components/shared/SearchInput.tsx
"use client";

export default function SearchInput() {
  const router = useRouter();
  const [value, set_value] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`?search=${value}&page=1`);  // updates URL after 400ms
    }, 400);
    return () => clearTimeout(timer);
  }, [value]);

  return <Input value={value} onChange={e => set_value(e.target.value)} />;
}
```

**Benefit:** Filters are bookmarkable. No client-side state management needed. Browser back button works correctly.

---

### Pattern 3: Server Actions for mutations

All create/update/delete operations use Server Actions — they run on the server, call the backend, and invalidate stale cache.

```tsx
// actions/campaign.actions.ts
"use server";

export async function toggle_campaign_action(campaign_id: string) {
  // This runs on the SERVER — not in the browser
  await server_fetch(`/admin/campaigns/${campaign_id}/toggle`, {
    method: "PATCH",
  });

  revalidateTag("campaigns");  // Next.js re-fetches campaign pages on next visit
}

// components/campaigns/CampaignTable.tsx
"use client";

function CampaignRow({ campaign }) {
  const [is_pending, start_transition] = useTransition();

  return (
    <Button
      onClick={() => start_transition(() => toggle_campaign_action(campaign.id))}
      disabled={is_pending}
    >
      {is_pending ? "Updating…" : "Toggle"}
    </Button>
  );
}
```

**Benefit:** Mutations happen server-side (auth cookie forwarded automatically). `revalidateTag` means the next page load shows fresh data without a full refresh.

---

### Pattern 4: server_fetch — authenticated API helper

`lib/api.ts` is the single function used everywhere to call the backend. It automatically reads and forwards the auth cookie.

```ts
// lib/api.ts

export async function server_fetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = (await cookies()).get("admin_auth_token")?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Cookie: `admin_auth_token=${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error((await res.json()).message);

  return res.json();
}
```

**Example — fetch with 60s cache:**
```ts
const data = await server_fetch<MetricsResponse>("/admin/metrics", {
  next: { revalidate: 60, tags: ["metrics"] },
});
```

**Example — POST mutation:**
```ts
await server_fetch("/admin/campaigns", {
  method: "POST",
  body: JSON.stringify({ campaignName: "XM SA 2025", brokerName: "XM", whopLink: "https://whop.com/..." }),
});
```

---

### Pattern 5: Caching strategy

| Page | Revalidate | Tag | Why |
|------|-----------|-----|-----|
| `/dashboard` | 60s | `metrics` | Metrics are near-real-time but not live |
| `/submissions` | 30s | `submissions` | New submissions arrive frequently |
| `/accounts` | 60s | `accounts` | New accounts arrive every minute via IMAP |
| `/jobs` | 30s | `jobs` | Jobs change state quickly |
| `/jobs/failed` | 60s | `failed-jobs` | Dead-letter doesn't change often |
| `/campaigns` | no-store | — | Always fresh — mutation-heavy page |
| `/templates` | no-store | — | Always fresh |
| `/parser-logs` | 60s | `parser-logs` | Appended every minute |
| `/audit-logs` | 60s | `audit-logs` | Appended on events |

After a Server Action mutation, call `revalidateTag("jobs")` etc. to immediately bust the relevant cached page so the next visit reflects the change.

---

## Backend API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/admin/auth/login` | — | Returns `{ data: { admin, token } }` |
| POST | `/admin/auth/logout` | Cookie | Invalidate session |
| GET | `/admin/metrics` | Cookie | `{ data: { metrics: {...} } }` |
| GET | `/admin/submissions?page&limit&status&search` | Cookie | `{ data: [], meta: {...} }` |
| GET | `/admin/accounts?page&limit` | Cookie | `{ data: [], meta: {...} }` |
| GET | `/admin/jobs?page&limit&status&channel` | Cookie | `{ data: [], meta: {...} }` |
| GET | `/admin/jobs/failed?page&limit` | Cookie | `{ data: [], meta: {...} }` |
| POST | `/admin/jobs/:id/retry` | Cookie | Resets job to PENDING |
| GET | `/admin/campaigns` | Cookie | `{ data: [] }` |
| POST | `/admin/campaigns` | Cookie | `{ campaignName, brokerName, whopLink }` |
| PUT | `/admin/campaigns/:id` | Cookie | Partial update |
| PATCH | `/admin/campaigns/:id/toggle` | Cookie | Flip isActive |
| DELETE | `/admin/campaigns/:id` | Cookie | Only if no submissions |
| GET | `/admin/templates` | Cookie | `{ data: [] }` |
| POST | `/admin/templates` | Cookie | `{ templateName, notificationType, templateBody, subjectLine? }` |
| PUT | `/admin/templates/:id` | Cookie | Partial update |
| PATCH | `/admin/templates/:id/toggle` | Cookie | Flip isActive |
| GET | `/admin/parser-logs?page&limit` | Cookie | `{ data: [], meta: {...} }` |
| GET | `/admin/audit-logs?page&limit&event_type` | Cookie | `{ data: [], meta: {...} }` |

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16 | Framework — App Router, Server Components, Server Actions |
| React | 19 | UI library |
| TypeScript | 5 | Type safety across all components and API responses |
| Tailwind CSS | 4 | Utility-first styling |
| shadcn/ui | 4 | Accessible components: Button, Card, Table, Dialog, Select, Badge, Input |
| sonner | 2 | Toast notifications for mutation feedback |

---

## Deployment

### Environment

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000   # dev
NEXT_PUBLIC_API_URL=https://api.domain.com  # prod
```

### Build

```bash
npm run build && npm start   # port 3000
```

### PM2

```bash
pm2 start npm --name "mt-admin" -- start
pm2 save
```

---

## Common Issues

**Redirected to /login immediately after logging in**
- The Route Handler proxy at `/api/auth/login` must successfully set the cookie. Check the browser DevTools → Application → Cookies for `admin_auth_token` on `localhost:3000`.

**Pages show stale data after campaign/job changes**
- Campaign and template pages use `cache: "no-store"` so they're always fresh.
- Job pages use `revalidateTag("jobs")` in the retry Server Action.
- If you still see stale data, hard-refresh (Ctrl+Shift+R) to bypass the browser cache.

**`searchParams is not iterable` error**
- In Next.js 15+, `searchParams` is a Promise. Always `await` it before reading:

```tsx
// ✅ Correct
const params = await searchParams;
const page = params.page ?? "1";

// ❌ Wrong
const page = searchParams.page ?? "1";
```
