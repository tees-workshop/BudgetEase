"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Leaf, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register" | "reset";

const copy: Record<AuthMode, { eyebrow: string; title: string; description: string; button: string }> = {
  login: {
    eyebrow: "WELCOME BACK",
    title: "Good to see you again.",
    description: "Sign in to pick up where you left off with your money.",
    button: "Log in",
  },
  register: {
    eyebrow: "YOUR NEXT CHAPTER",
    title: "Make room for better money habits.",
    description: "Create your free account and start seeing your finances more clearly.",
    button: "Create account",
  },
  reset: {
    eyebrow: "ACCOUNT RECOVERY",
    title: "Let's get you back in.",
    description: "Enter your email and we'll send you a password reset link.",
    button: "Send reset link",
  },
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

        if (data.session) {
          router.push("/onboarding");
          router.refresh();
          return;
        }

        setMessage({
          type: "success",
          text: "Account started! Check your email to confirm your address before signing in.",
        });
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
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
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)]">
      <section className="relative hidden overflow-hidden bg-[#151A18] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-28 -top-20 h-96 w-96 rounded-full bg-[#147D52]/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#42D99A]/10 blur-3xl" />
        <Link href="/" className="relative z-10 inline-flex w-fit items-center gap-2.5" aria-label="BudgetEase home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#147D52]"><Leaf size={21} /></span>
          <span className="text-xl font-bold tracking-tight">BudgetEase<span className="text-[#42D99A]">.</span></span>
        </Link>
        <div className="relative z-10 max-w-xl pb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-[#9BEBC5]"><span className="h-2 w-2 rounded-full bg-[#42D99A]" /> A calmer money routine</span>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.08] tracking-[-0.05em] xl:text-6xl">Small steps.<br /><span className="text-[#42D99A]">Clearer money.</span></h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/65">Your everyday spending, your goals, and your next decision—all in one thoughtful place.</p>
          <div className="mt-10 flex items-center gap-3 text-sm text-white/55"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#42D99A]"><Leaf size={16} /></span> Built for your real life, one choice at a time.</div>
        </div>
        <p className="relative z-10 text-xs text-white/40">BudgetEase · Personal finance, made clearer.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-[#68736C] transition hover:text-[#147D52] lg:hidden"><ArrowLeft size={16} /> Back to home</Link>
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.18em] text-[#147D52]">{content.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#151A18] sm:text-4xl">{content.title}</h2>
            <p className="mt-3 leading-6 text-[#68736C]">{content.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <div>
                <label htmlFor="displayName" className="mb-2 block text-sm font-semibold text-[#303A33]">Your name</label>
                <input id="displayName" name="displayName" autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={80} className="w-full rounded-xl border border-[#DDE4DE] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#9AA39D] focus:border-[#147D52] focus:ring-4 focus:ring-[#147D52]/10" placeholder="What should we call you?" />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#303A33]">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} className="w-full rounded-xl border border-[#DDE4DE] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#9AA39D] focus:border-[#147D52] focus:ring-4 focus:ring-[#147D52]/10" placeholder="you@example.com" />
            </div>
            {mode !== "reset" && (
              <div>
                <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="password" className="block text-sm font-semibold text-[#303A33]">Password</label>{mode === "login" && <Link href="/forgot-password" className="text-xs font-semibold text-[#147D52] hover:underline">Forgot password?</Link>}</div>
                <div className="relative">
                  <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={72} className="w-full rounded-xl border border-[#DDE4DE] bg-white px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-[#9AA39D] focus:border-[#147D52] focus:ring-4 focus:ring-[#147D52]/10" placeholder="At least 8 characters" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#7A847E] hover:text-[#147D52]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {mode === "register" && <p className="mt-2 text-xs text-[#7A847E]">Use at least 8 characters for your password.</p>}
              </div>
            )}

            {message && <div role="status" aria-live="polite" className={`rounded-xl border px-4 py-3 text-sm leading-6 ${message.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-[#C7EED9] bg-[#EFFBF4] text-[#176B48]"}`}>{message.text}</div>}

            <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#147D52] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#106743] disabled:cursor-not-allowed disabled:opacity-65">
              {busy ? <><LoaderCircle size={17} className="animate-spin" /> Please wait…</> : <>{content.button} <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#68736C]">
            {mode === "login" ? <>New to BudgetEase? <Link href="/register" className="font-bold text-[#147D52] hover:underline">Create an account</Link></> : mode === "register" ? <>Already have an account? <Link href="/login" className="font-bold text-[#147D52] hover:underline">Log in</Link></> : <>Remembered your password? <Link href="/login" className="font-bold text-[#147D52] hover:underline">Back to log in</Link></>}
          </p>
          <p className="mt-8 text-center text-xs leading-5 text-[#8A938D]">By continuing, you agree to use BudgetEase responsibly. Your personal financial records should remain private.</p>
        </div>
      </section>
    </main>
  );
}
