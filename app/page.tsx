// Root route: redirect to /dashboard.
// Middleware handles auth — unauthenticated users are
// redirected to /login before this redirect fires.

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
