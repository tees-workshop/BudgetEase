import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { TransactionsWorkspace } from "@/components/transactions/transactions-workspace";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?next=/transactions");

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
  const displayName = profile?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "Your account";

  return (
    <AppShell userName={displayName}>
      <Suspense fallback={<div className="rounded-2xl border border-[#E6EBE7] bg-white p-10 text-center text-sm text-[#68736C]">Loading transactions…</div>}><TransactionsWorkspace userId={user.id} /></Suspense>
    </AppShell>
  );
}
