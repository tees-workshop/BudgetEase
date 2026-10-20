"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3, ChevronDown, CircleHelp, CreditCard, LayoutDashboard,
  Leaf, Lightbulb, LogOut, Menu, MoreHorizontal, Settings, Target, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/insights", label: "Insights", icon: Lightbulb },
];

export function AppShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  const initials = userName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "Y";

  return (
    <div className="min-h-screen bg-[#F1EEE5] text-[#151A18]">
      {mobileOpen && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-[#151A18]/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[252px] flex-col border-r border-[#E2E0D5] bg-white px-4 py-5 transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2">
          <Link href="/dashboard" className="inline-flex items-center gap-2.5" onClick={() => setMobileOpen(false)}><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#152A1E] text-[#D8FF70]"><Leaf size={19} /></span><span className="text-lg font-bold tracking-[-0.04em]">BudgetEase<span className="text-[#426F37]">.</span></span></Link>
          <button className="rounded-lg p-2 text-[#68736C] hover:bg-[#F1EEE5] lg:hidden" aria-label="Close menu" onClick={() => setMobileOpen(false)}><X size={18} /></button>
        </div>

        <p className="mb-3 mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#929B95]">Your workspace</p>
        <nav className="space-y-1" aria-label="Main navigation">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
            return <Link key={href} href={href} onClick={() => setMobileOpen(false)} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-[#D8FF70] text-[#152A1E]" : "text-[#68736C] hover:bg-[#F1EEE5] hover:text-[#151A18]"}`}><Icon size={18} strokeWidth={active ? 2.3 : 1.8} />{label}</Link>;
          })}
        </nav>

        <div className="mt-auto">
          <div className="mb-4 rounded-2xl bg-[#F1EEE5] p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#426F37]"><CircleHelp size={18} /></span><p className="mt-3 text-sm font-bold">A little at a time.</p><p className="mt-1 text-xs leading-5 text-[#68736C]">Small, consistent money habits can make a difference.</p></div>
          <Link href="/settings" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${pathname.startsWith("/settings") ? "bg-[#D8FF70] text-[#152A1E]" : "text-[#68736C] hover:bg-[#F1EEE5]"}`}><Settings size={18} />Settings</Link>
          <button type="button" onClick={signOut} disabled={signingOut} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#68736C] transition hover:bg-red-50 hover:text-red-700 disabled:opacity-60"><LogOut size={18} />{signingOut ? "Signing out…" : "Log out"}</button>
          <div className="mt-4 flex items-center gap-3 border-t border-[#E2E0D5] px-2 pt-4"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DDF5E8] text-xs font-bold text-[#426F37]">{initials}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{userName || "Your account"}</p><p className="text-xs text-[#7A847E]">Personal account</p></div><ChevronDown size={15} className="text-[#9AA39D]" /></div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[252px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#E2E0D5] bg-[#FFFCF5]/95 px-4 backdrop-blur sm:px-7 lg:px-9">
          <div className="flex items-center gap-3"><button className="rounded-xl border border-[#E2E0D5] p-2 text-[#68736C] hover:bg-[#F1EEE5] lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={19} /></button><div><p className="text-xs text-[#7A847E]">Your money, your pace</p><p className="text-sm font-bold">Personal finances</p></div></div>
          <div className="flex items-center gap-2 rounded-full border border-[#E2E0D5] bg-[#FFFCF5] px-3 py-2 text-xs font-semibold text-[#68736C]"><span className="h-2 w-2 rounded-full bg-[#42D99A]" /> NGN · ₦</div>
        </header>
        <main className="mx-auto max-w-[1440px] px-4 py-7 pb-24 sm:px-7 sm:py-9 sm:pb-24 lg:px-9 lg:pb-9">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[#E2E0D5] bg-[#FFFCF5]/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur lg:hidden" aria-label="Mobile navigation">
        {navigation.filter((item) => ["/dashboard", "/transactions", "/budgets", "/insights"].includes(item.href)).map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return <Link key={href} href={href} onClick={() => setMoreOpen(false)} className={`flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold ${active ? "text-[#426F37]" : "text-[#7A847E]"}`}><Icon size={19} />{label}</Link>;
        })}
        <button type="button" onClick={() => setMoreOpen((open) => !open)} aria-expanded={moreOpen} className={`flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold ${moreOpen || pathname === "/analytics" || pathname.startsWith("/settings") ? "text-[#426F37]" : "text-[#7A847E]"}`}><MoreHorizontal size={19} />More</button>
        {moreOpen && <div className="absolute bottom-full right-2 mb-2 w-48 rounded-2xl border border-[#E2E0D5] bg-white p-2 shadow-xl">
          <Link href="/analytics" onClick={() => setMoreOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#56615A] hover:bg-[#F1EEE5]"><BarChart3 size={17} />Analytics</Link>
          <Link href="/settings" onClick={() => setMoreOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#56615A] hover:bg-[#F1EEE5]"><Settings size={17} />Settings</Link>
        </div>}
      </nav>
    </div>
  );
}
