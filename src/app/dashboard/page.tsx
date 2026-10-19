import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Plus, Sparkles, Target, Wallet } from "lucide-react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Overview" };

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function SummaryCard({ label, value, hint, icon: Icon, tone }: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Wallet;
  tone: "green" | "neutral" | "amber";
}) {
  const tones = {
    green: "bg-[#E5F8EE] text-[#147D52]",
    neutral: "bg-[#F5F7F5] text-[#68736C]",
    amber: "bg-[#FFF3E2] text-[#A76722]",
  };

  return (
    <article className="rounded-2xl border border-[#E6EBE7] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-[#68736C]">{label}</p><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={18} /></span></div>
      <p className="mt-4 text-2xl font-semibold tracking-[-0.045em] text-[#151A18] sm:text-3xl">{value}</p>
      <p className="mt-2 text-xs text-[#7A847E]">{hint}</p>
    </article>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login?next=/dashboard");

  const [{ data: profile }, { data: transactions, error: transactionsError }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    supabase.from("transactions").select("id, amount, type, description, transaction_date").eq("user_id", user.id).order("transaction_date", { ascending: false }).order("created_at", { ascending: false }).limit(500),
  ]);

  const allTransactions = transactions ?? [];
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const currentMonthTransactions = allTransactions.filter((transaction) => {
    const date = new Date(`${transaction.transaction_date}T00:00:00`);
    return date >= monthStart && date < monthEnd;
  });
  const income = currentMonthTransactions.reduce((sum, transaction) => transaction.type === "income" ? sum + Number(transaction.amount) : sum, 0);
  const expenses = currentMonthTransactions.reduce((sum, transaction) => transaction.type === "expense" ? sum + Number(transaction.amount) : sum, 0);
  const net = income - expenses;
  const displayName = profile?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "there";
  const monthLabel = today.toLocaleDateString("en-NG", { month: "long", year: "numeric" });

  return (
    <AppShell userName={displayName}>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-[#147D52]">{monthLabel}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Good day, {displayName.split(" ")[0]}.</h1><p className="mt-2 text-sm leading-6 text-[#68736C]">Here's how your money is moving this month.</p></div>
        <Link href="/transactions?new=1" className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#147D52] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#106743] sm:self-auto"><Plus size={17} /> Add transaction</Link>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Monthly summary">
        <SummaryCard label="Money in" value={money.format(income)} hint="Income recorded this month" icon={ArrowDownRight} tone="green" />
        <SummaryCard label="Money out" value={money.format(expenses)} hint="Expenses recorded this month" icon={ArrowUpRight} tone="amber" />
        <SummaryCard label="Net cash flow" value={money.format(net)} hint="Income minus expenses · not bank balance" icon={Wallet} tone="neutral" />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-2xl border border-[#E6EBE7] bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><h2 className="font-bold">Recent activity</h2><p className="mt-1 text-sm text-[#7A847E]">Your latest recorded transactions</p></div><Link href="/transactions" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#147D52] hover:underline">View all <ArrowRight size={14} /></Link></div>
          {transactionsError ? <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">We couldn't load your transactions. Please refresh to try again.</p> : allTransactions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#DDE4DE] bg-[#FAFBFA] px-5 py-10 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5F8EE] text-[#147D52]"><Wallet size={22} /></span><h3 className="mt-4 font-bold">Your story starts with one entry.</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#68736C]">Add your first income or expense to start seeing your money patterns here.</p><Link href="/transactions?new=1" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#147D52] hover:underline"><Plus size={16} /> Add your first transaction</Link></div>
          ) : (
            <div className="mt-5 divide-y divide-[#EEF1EE]">{allTransactions.slice(0, 5).map((transaction) => <div key={transaction.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${transaction.type === "income" ? "bg-[#E5F8EE] text-[#147D52]" : "bg-[#F5F7F5] text-[#68736C]"}`}>{transaction.type === "income" ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{transaction.description || (transaction.type === "income" ? "Income" : "Expense")}</p><p className="mt-1 text-xs text-[#7A847E]">{new Date(`${transaction.transaction_date}T00:00:00`).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p></div><p className={`shrink-0 text-sm font-bold ${transaction.type === "income" ? "text-[#147D52]" : "text-[#303A33]"}`}>{transaction.type === "income" ? "+" : "−"}{money.format(Number(transaction.amount))}</p></div>)}</div>
          )}
        </article>

        <div className="space-y-5">
          <article className="rounded-2xl bg-[#151A18] p-6 text-white"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#42D99A]"><Sparkles size={20} /></span><h2 className="mt-5 text-lg font-bold">Insights that mean something.</h2><p className="mt-2 text-sm leading-6 text-white/65">Once you've recorded enough activity, BudgetEase can help surface patterns based on your actual numbers—not guesses.</p><Link href="/insights" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#42D99A] hover:underline">Explore insights <ArrowRight size={15} /></Link></article>
          <article className="rounded-2xl border border-[#E6EBE7] bg-white p-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F8EE] text-[#147D52]"><Target size={20} /></span><h2 className="mt-4 font-bold">Make a budget that fits.</h2><p className="mt-2 text-sm leading-6 text-[#68736C]">Set a monthly limit for an expense category and track it as you go.</p><Link href="/budgets" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#147D52] hover:underline">Set up a budget <ArrowRight size={15} /></Link></article>
          <article className="rounded-2xl border border-[#E6EBE7] bg-white p-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F7F5] text-[#68736C]"><BarChart3 size={20} /></span><h2 className="mt-4 font-bold">A clearer picture over time.</h2><p className="mt-2 text-sm leading-6 text-[#68736C]">Your dashboard uses the transactions you record. No bank connection or balance is assumed.</p></article>
        </div>
      </section>
      <p className="mt-6 text-center text-xs leading-5 text-[#929B95]">Your summaries reflect transactions you've entered. They are not a bank balance or financial advice.</p>
    </AppShell>
  );
}
