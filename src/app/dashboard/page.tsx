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
    <article className="motion-card rounded-2xl border border-[#E6EBE7] bg-white p-5 sm:p-6">
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
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (6 - index));
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    const total = allTransactions.reduce((sum, transaction) => (
      transaction.type === "expense" && transaction.transaction_date === key
        ? sum + Number(transaction.amount)
        : sum
    ), 0);
    return { key, label: date.toLocaleDateString("en-NG", { weekday: "short" }), total };
  });
  const maxDailyExpense = Math.max(...lastSevenDays.map((day) => day.total), 1);
  const weeklyExpenses = lastSevenDays.reduce((sum, day) => sum + day.total, 0);
  const expenseShare = income > 0 ? Math.min((expenses / income) * 100, 100) : 0;
  const displayName = profile?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "there";
  const monthLabel = today.toLocaleDateString("en-NG", { month: "long", year: "numeric" });

  return (
    <AppShell userName={displayName}>
      <div className="animate-float-in relative isolate overflow-hidden rounded-[2rem] bg-[#111915] p-6 text-white shadow-[0_24px_70px_rgba(17,25,21,0.18)] sm:p-9 lg:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-[#147D52]/45 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[-9rem] right-1/3 -z-10 h-64 w-64 rounded-full bg-[#42D99A]/10 blur-3xl" />
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/75">
              <span className="h-1.5 w-1.5 rounded-full bg-[#42D99A] shadow-[0_0_10px_rgba(66,217,154,0.9)]" />
              Your money, in focus
            </div>
            <p className="mt-5 text-sm text-white/55">{monthLabel}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Good day, {displayName.split(" ")[0]}.</h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/65">A clearer view of what came in, what went out, and where you stand this month.</p>
          </div>
          <Link href="/transactions?new=1" className="interactive-lift inline-flex items-center justify-center gap-2 rounded-xl bg-[#42D99A] px-4 py-3 text-sm font-bold text-[#102219] shadow-[0_8px_24px_rgba(66,217,154,0.16)] hover:bg-[#65e5ae]">
            <Plus size={17} /> Add transaction
          </Link>
        </div>

        <div className="mt-9 grid gap-7 border-t border-white/10 pt-6 md:grid-cols-[1.15fr_0.85fr] md:items-end md:gap-10">
          <div>
            <p className="text-sm font-medium text-white/55">Net cash flow this month</p>
            <p className="mt-2 break-words text-4xl font-semibold tracking-[-0.06em] sm:text-5xl lg:text-6xl">{money.format(net)}</p>
            <p className="mt-3 text-xs leading-5 text-white/45">Income minus expenses recorded in BudgetEase — not your bank balance.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-white/65">Expenses vs. income</span>
              <span className="font-semibold text-[#42D99A]">{income > 0 ? `${Math.round(expenseShare)}%` : "—"}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-[#147D52] to-[#42D99A] transition-[width] duration-700" style={{ width: `${expenseShare}%` }} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div><p className="text-xs text-white/45">Money in</p><p className="mt-1 text-sm font-semibold text-white">{money.format(income)}</p></div>
              <div className="text-right"><p className="text-xs text-white/45">Money out</p><p className="mt-1 text-sm font-semibold text-white">{money.format(expenses)}</p></div>
            </div>
            {income === 0 && <p className="mt-3 text-xs leading-5 text-white/45">Record income to see how spending compares with it.</p>}
          </div>
        </div>
      </div>

      <section className="motion-stagger mt-5 grid gap-4 sm:grid-cols-3" aria-label="Monthly summary">
        <SummaryCard label="Money in" value={money.format(income)} hint="Income recorded this month" icon={ArrowDownRight} tone="green" />
        <SummaryCard label="Money out" value={money.format(expenses)} hint="Expenses recorded this month" icon={ArrowUpRight} tone="amber" />
        <SummaryCard label="Net cash flow" value={money.format(net)} hint="Income minus expenses" icon={Wallet} tone={net >= 0 ? "green" : "amber"} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="motion-card rounded-3xl border border-[#E6EBE7] bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#147D52]">Spending pulse</p><h2 className="mt-2 text-xl font-semibold tracking-tight">Last 7 days</h2><p className="mt-1 text-sm text-[#7A847E]">Daily expenses you’ve recorded</p></div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E5F8EE] text-[#147D52]"><BarChart3 size={20} /></span>
          </div>
          <div className="mt-7 flex h-36 items-end gap-2 sm:gap-3" role="img" aria-label={`Expenses over the last seven days total ${money.format(weeklyExpenses)}`}>
            {lastSevenDays.map((day, index) => (
              <div key={day.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                <div className="flex h-full w-full items-end overflow-hidden rounded-t-lg bg-[#F1F5F1]">
                  <div className={`w-full rounded-t-lg transition-[height] duration-700 ${index === 6 ? "bg-gradient-to-t from-[#147D52] to-[#42D99A]" : "bg-[#B8E8CF]"}`} style={{ height: `${day.total > 0 ? Math.max((day.total / maxDailyExpense) * 100, 5) : 3}%` }} />
                </div>
                <span className={`text-[11px] ${index === 6 ? "font-bold text-[#147D52]" : "text-[#929B95]"}`}>{day.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-end justify-between border-t border-[#EEF1EE] pt-4">
            <div><p className="text-xs text-[#7A847E]">Total in this period</p><p className="mt-1 text-lg font-semibold tracking-tight">{money.format(weeklyExpenses)}</p></div>
            <span className="rounded-full bg-[#F5F7F5] px-3 py-1.5 text-xs font-medium text-[#68736C]">7-day view</span>
          </div>
        </article>

        <article className="motion-card rounded-3xl border border-[#E6EBE7] bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#147D52]">Your activity</p><h2 className="mt-2 text-xl font-semibold tracking-tight">Recent transactions</h2><p className="mt-1 text-sm text-[#7A847E]">Your latest money moves</p></div>
            <Link href="/transactions" className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F2F7F3] px-3 py-2 text-xs font-bold text-[#147D52] hover:bg-[#E5F8EE]">View all <ArrowRight size={14} /></Link>
          </div>
          {transactionsError ? <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">We couldn’t load your transactions. Please refresh to try again.</p> : allTransactions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#DDE4DE] bg-[#FAFBFA] px-5 py-9 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5F8EE] text-[#147D52]"><Wallet size={22} /></span><h3 className="mt-4 font-bold">Your story starts with one entry.</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#68736C]">Add your first income or expense to start seeing your money patterns here.</p><Link href="/transactions?new=1" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#147D52] hover:underline"><Plus size={16} /> Add your first transaction</Link></div>
          ) : (
            <div className="mt-4 divide-y divide-[#EEF1EE]">{allTransactions.slice(0, 5).map((transaction) => <div key={transaction.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${transaction.type === "income" ? "bg-[#E5F8EE] text-[#147D52]" : "bg-[#FFF3E2] text-[#A76722]"}`}>{transaction.type === "income" ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{transaction.description || (transaction.type === "income" ? "Income" : "Expense")}</p><p className="mt-1 text-xs text-[#7A847E]">{new Date(`${transaction.transaction_date}T00:00:00`).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p></div><p className={`shrink-0 text-sm font-bold ${transaction.type === "income" ? "text-[#147D52]" : "text-[#303A33]"}`}>{transaction.type === "income" ? "+" : "−"}{money.format(Number(transaction.amount))}</p></div>)}</div>
          )}
        </article>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2">
        <Link href="/insights" className="interactive-lift group relative isolate overflow-hidden rounded-3xl bg-[#E5F8EE] p-6 sm:p-7">
          <div aria-hidden="true" className="absolute -right-8 -top-12 -z-10 h-40 w-40 rounded-full bg-[#42D99A]/30 blur-2xl transition-transform duration-500 group-hover:scale-125" />
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#147D52] shadow-sm"><Sparkles size={20} /></span>
          <h2 className="mt-5 text-xl font-semibold tracking-tight">Find the story in your spending.</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#50685A]">Explore patterns drawn from the transactions you’ve actually recorded—no made-up predictions.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#147D52]">Explore insights <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
        </Link>
        <Link href="/budgets" className="interactive-lift group rounded-3xl border border-[#E6EBE7] bg-white p-6 sm:p-7">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F7F5] text-[#147D52]"><Target size={20} /></span>
          <h2 className="mt-5 text-xl font-semibold tracking-tight">Give every naira a plan.</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#68736C]">Set a monthly limit for a category and check your progress as you go.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#147D52]">Manage budgets <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
        </Link>
      </section>
      <p className="mt-6 text-center text-xs leading-5 text-[#929B95]">Summaries reflect transactions you’ve entered. They are not a bank balance or financial advice.</p>
    </AppShell>
  );
}
