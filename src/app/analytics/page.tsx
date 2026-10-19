import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { AnalyticsWorkspace } from "@/components/analytics/analytics-workspace";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?next=/analytics");
  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
  const displayName = profile?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "Your account";

  return <AppShell userName={displayName}><AnalyticsWorkspace userId={user.id} /></AppShell>;
}
