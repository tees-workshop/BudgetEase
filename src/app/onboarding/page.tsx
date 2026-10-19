"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Leaf, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!active) return;

      if (userError || !user) {
        router.replace("/login?next=/onboarding");
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
      if (!active) return;
      setName(profile?.display_name || user.user_metadata?.display_name || "");
      setLoading(false);
    }

    loadProfile().catch(() => {
      if (active) {
        setError("We couldn't load your profile. Please refresh and try again.");
        setLoading(false);
      }
    });

    return () => { active = false; };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.replace("/login?next=/onboarding");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: name.trim(),
        currency: "NGN",
      }, { onConflict: "id" });

      if (profileError) throw profileError;
      router.push("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't save your details. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7F5] px-5 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-[#E6EBE7] bg-white p-7 shadow-sm sm:p-10">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-[#151A18]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#147D52] text-white"><Leaf size={19} /></span>BudgetEase<span className="text-[#147D52]">.</span></Link>
        {loading ? (
          <div className="flex items-center gap-3 py-20 text-sm text-[#68736C]"><LoaderCircle size={18} className="animate-spin" /> Getting your account ready…</div>
        ) : (
          <>
            <p className="mt-10 text-xs font-bold tracking-[0.18em] text-[#147D52]">A QUICK HELLO</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#151A18]">Let's make this yours.</h1>
            <p className="mt-3 leading-6 text-[#68736C]">What should we call you? You can change this any time in your settings.</p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div><label htmlFor="name" className="mb-2 block text-sm font-semibold text-[#303A33]">Your name</label><input id="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} autoComplete="name" placeholder="Enter your name" className="w-full rounded-xl border border-[#DDE4DE] px-4 py-3.5 text-sm outline-none transition focus:border-[#147D52] focus:ring-4 focus:ring-[#147D52]/10" /></div>
              <div className="rounded-2xl bg-[#F5F7F5] p-4"><p className="text-sm font-semibold text-[#303A33]">Your currency</p><p className="mt-1 text-sm text-[#68736C]">Nigerian naira (₦) · NGN</p></div>
              {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#147D52] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#106743] disabled:opacity-60">{saving ? <><LoaderCircle size={17} className="animate-spin" /> Saving…</> : <>Continue to dashboard <ArrowRight size={16} /></>}</button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
