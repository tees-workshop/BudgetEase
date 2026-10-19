"use client";

import { FormEvent, useState } from "react";
import { Check, CircleAlert, KeyRound, LoaderCircle, Mail, ShieldCheck, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SettingsWorkspace({ userId, email, initialName }: { userId: string; email: string; initialName: string }) {
  const [name, setName] = useState(initialName);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingProfile(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.from("profiles").update({ display_name: name.trim() }).eq("id", userId);
      if (updateError) throw updateError;
      setNotice("Your profile has been updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't update your profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (newPassword.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The passwords don't match.");
      return;
    }
    setSavingPassword(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setNewPassword("");
      setConfirmPassword("");
      setNotice("Your password has been updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't update your password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div>
      <div><p className="text-sm font-medium text-[#147D52]">Your account, your choices</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Settings</h1><p className="mt-2 text-sm leading-6 text-[#68736C]">Manage your profile and account security.</p></div>
      {notice && <p role="status" className="mt-5 flex items-center gap-2 rounded-xl border border-[#C7EED9] bg-[#EFFBF4] px-4 py-3 text-sm text-[#176B48]"><Check size={16} />{notice}</p>}
      {error && <p role="alert" className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"><CircleAlert size={16} />{error}</p>}

      <div className="mt-7 grid max-w-4xl gap-5">
        <section className="rounded-2xl border border-[#E6EBE7] bg-white p-5 sm:p-7"><div className="flex items-start gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F8EE] text-[#147D52]"><UserRound size={19} /></span><div><h2 className="font-bold">Profile</h2><p className="mt-1 text-sm text-[#7A847E]">The name shown around your BudgetEase account.</p></div></div>
          <form onSubmit={saveProfile} className="mt-6 space-y-5"><div><label htmlFor="displayName" className="mb-2 block text-sm font-semibold text-[#303A33]">Display name</label><input id="displayName" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="w-full max-w-lg rounded-xl border border-[#DDE4DE] px-4 py-3 text-sm outline-none focus:border-[#147D52] focus:ring-4 focus:ring-[#147D52]/10" /></div><div><label className="mb-2 block text-sm font-semibold text-[#303A33]">Email address</label><div className="flex max-w-lg items-center gap-3 rounded-xl bg-[#F5F7F5] px-4 py-3 text-sm text-[#68736C]"><Mail size={16} />{email || "No email address available"}<span className="ml-auto text-xs">Managed by sign-in</span></div></div><div><label className="mb-2 block text-sm font-semibold text-[#303A33]">Currency</label><div className="max-w-lg rounded-xl bg-[#F5F7F5] px-4 py-3 text-sm text-[#68736C]">Nigerian naira (₦) · NGN <span className="ml-2 text-xs text-[#929B95]">Fixed for this version</span></div></div><button type="submit" disabled={savingProfile || !name.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#147D52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#106743] disabled:opacity-60">{savingProfile ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />}{savingProfile ? "Saving…" : "Save profile"}</button></form>
        </section>

        <section className="rounded-2xl border border-[#E6EBE7] bg-white p-5 sm:p-7"><div className="flex items-start gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F7F5] text-[#68736C]"><KeyRound size={19} /></span><div><h2 className="font-bold">Password and security</h2><p className="mt-1 text-sm text-[#7A847E]">Choose a strong password you don't use elsewhere.</p></div></div>
          <form onSubmit={updatePassword} className="mt-6 space-y-5"><div><label htmlFor="newPassword" className="mb-2 block text-sm font-semibold text-[#303A33]">New password</label><input id="newPassword" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="At least 8 characters" className="w-full max-w-lg rounded-xl border border-[#DDE4DE] px-4 py-3 text-sm outline-none focus:border-[#147D52] focus:ring-4 focus:ring-[#147D52]/10" /></div><div><label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-[#303A33]">Confirm new password</label><input id="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter the same password again" className="w-full max-w-lg rounded-xl border border-[#DDE4DE] px-4 py-3 text-sm outline-none focus:border-[#147D52] focus:ring-4 focus:ring-[#147D52]/10" /></div><button type="submit" disabled={savingPassword} className="inline-flex items-center gap-2 rounded-xl border border-[#DDE4DE] px-5 py-3 text-sm font-bold text-[#303A33] transition hover:bg-[#F5F7F5] disabled:opacity-60">{savingPassword ? <LoaderCircle size={16} className="animate-spin" /> : <KeyRound size={16} />}{savingPassword ? "Updating…" : "Update password"}</button></form>
        </section>

        <section className="rounded-2xl border border-[#C7EED9] bg-[#EFFBF4] p-5 sm:p-6"><div className="flex items-start gap-3"><ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#147D52]" /><div><h2 className="font-bold text-[#176B48]">Your data stays yours</h2><p className="mt-2 text-sm leading-6 text-[#386B53]">Your financial records are protected by account-based database policies. BudgetEase does not connect to your bank in this version, and summaries use the transactions you enter.</p></div></div></section>
      </div>
    </div>
  );
}
