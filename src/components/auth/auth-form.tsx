"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register" | "reset";

const copy: Record<AuthMode, { eyebrow: string; title: string; description: string; button: string }> = {
  login: { eyebrow: "WELCOME BACK", title: "Your money story, right where you left it.", description: "Sign in to see what’s happening with your money and what comes next.", button: "Log in to BudgetEase" },
  register: { eyebrow: "A FRESH START", title: "Make your next money move a better one.", description: "Create your free account and build a clearer picture of your everyday finances.", button: "Create my account" },
  reset: { eyebrow: "ACCOUNT RECOVERY", title: "Let’s get you back on track.", description: "Enter the email address linked to your account and we’ll send a reset link.", button: "Send reset link" },
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const content = copy[mode];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createClient();
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
          },
        });
        if (error) throw error;
        if (data.session) { router.push("/onboarding"); router.refresh(); return; }
        setMessage({ type: "success", text: "Account started! Check your email to confirm your address before signing in." });
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        const next = searchParams.get("next");
        const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
        router.push(safeNext);
        router.refresh();
        return;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
        });
        if (error) throw error;
        setMessage({ type: "success", text: "If an account exists for that email, a password reset link is on its way." });
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen min-h-screen bg-[#F7F4EB] lg:grid lg:grid-cols-[1.04fr_0.96fr]">
      <section className="auth-story relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#10231A] p-10 text-[#F7F4EB] lg:flex xl:p-16">
        <div aria-hidden="true" className="auth-orbit auth-orbit-one" />
        <div aria-hidden="true" className="auth-orbit auth-orbit-two" />
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "linear-gradient(rgba(216,255,112,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(216,255,112,.16) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "linear-gradient(135deg, black, transparent 75%)" }} />
        <Link href="/" aria-label="BudgetEase home" className="relative z-10 w-fit"><BrandLogo theme="dark" size="md" /></Link>
        <div className="auth-story-copy relative z-10 max-w-2xl pb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D8FF70]/25 bg-[#D8FF70]/[0.08] px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-[#D8FF70]"><Sparkles size={13} /> Money clarity looks good on you</span>
          <h1 className="mt-7 text-5xl font-semibold leading-[1.04] tracking-[-0.065em] xl:text-7xl">Less money stress.<br /><span className="text-[#D8FF70]">More main-character</span><br />energy.</h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-white/60">A thoughtful space for your income, spending and goals. No judgement. Just a clearer way to move.</p>
          <div className="mt-12 grid max-w-lg grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/45">Your pace</p><p className="mt-2 text-lg font-semibold">One step at a time.</p></div>
            <div className="rounded-2xl border border-[#D8FF70]/20 bg-[#D8FF70]/[0.08] p-4"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#D8FF70]/70">Your money</p><p className="mt-2 text-lg font-semibold">Your rules. Always.</p></div>
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/35">BudgetEase · Personal finance, made clearer.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-10 lg:px-12 xl:px-16">
        <div className="w-full max-w-[460px] animate-soft-scale-in">
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <Link href="/" aria-label="BudgetEase home"><BrandLogo theme="light" size="md" /></Link>
            <Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-[#657066]"><ArrowLeft size={14} /> Home</Link>
          </div>
          <div className="mb-9">
            <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#426F37]">{content.eyebrow}</p>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.06em] text-[#15221A] sm:text-[2.9rem]">{content.title}</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#657066]">{content.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && <div><label htmlFor="displayName" className="mb-2 block text-xs font-bold text-[#26382C]">Your name</label><input id="displayName" name="displayName" autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={80} className="auth-input" placeholder="What should we call you?" /></div>}
            <div><label htmlFor="email" className="mb-2 block text-xs font-bold text-[#26382C]">Email address</label><input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} className="auth-input" placeholder="you@example.com" /></div>
            {mode !== "reset" && <div><div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="password" className="block text-xs font-bold text-[#26382C]">Password</label>{mode === "login" && <Link href="/forgot-password" className="text-xs font-bold text-[#426F37] hover:underline">Forgot password?</Link>}</div><div className="relative"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={72} className="auth-input pr-12" placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#7A847E] hover:text-[#426F37]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{mode === "register" && <p className="mt-2 text-xs text-[#7A847E]">Use at least 8 characters for your password.</p>}</div>}
            {message && <div role="status" aria-live="polite" className={`rounded-xl border px-4 py-3 text-sm leading-6 ${message.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-[#DCE7C4] bg-[#F0F6D9] text-[#345A2D]"}`}>{message.text}</div>}
            <button type="submit" disabled={busy} className="auth-submit group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D8FF70] px-5 py-4 text-sm font-extrabold text-[#15221A] shadow-[0_12px_28px_rgba(117,145,45,.15)] transition hover:bg-[#c9f25b] disabled:cursor-not-allowed disabled:opacity-65">{busy ? <><LoaderCircle size={17} className="animate-spin" /> Please wait…</> : <>{content.button}<ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></>}</button>
          </form>

          <p className="mt-8 text-center text-sm text-[#657066]">{mode === "login" ? <>New to BudgetEase? <Link href="/register" className="font-extrabold text-[#345A2D] hover:underline">Create an account</Link></> : mode === "register" ? <>Already have an account? <Link href="/login" className="font-extrabold text-[#345A2D] hover:underline">Log in</Link></> : <>Remembered your password? <Link href="/login" className="font-extrabold text-[#345A2D] hover:underline">Back to log in</Link></>}</p>
          <p className="mt-9 border-t border-[#E2E0D5] pt-5 text-center text-[11px] leading-5 text-[#8A938D]">Your personal financial records stay private. BudgetEase is here to help you understand your money, not judge it.</p>
        </div>
      </section>
    </main>
  );
}
