import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { SettingsWorkspace } from "@/components/settings/settings-workspace";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?next=/settings");
  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
  const displayName = profile?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "Your account";

  return <AppShell userName={displayName}><SettingsWorkspace userId={user.id} email={user.email ?? ""} initialName={displayName} /></AppShell>;
}
