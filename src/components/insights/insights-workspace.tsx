"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarClock, CheckCircle2, Lightbulb, LoaderCircle, ShieldAlert, Sparkles, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Transaction = { id: string; category_id: string; type: "income" | "expense"; amount: number | string; transaction_date: string };
type Category = { id: string; name: string; type: "income" | "expense" };
const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export function InsightsWorkspace({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const [transactionResult, categoryResult] = await Promise.all([
      supabase.from("transactions").select("id,category_id,type,amount,transaction_date").eq("user_id", userId).order("transaction_date", { ascending: true }).limit(10000),
      supabase.from("categories").select("id,name,type"),
    ]);
    if (transactionResult.error) setError(transactionResult.error.message);
    else setTransactions((transactionResult.data ?? []) as Transaction[]);
    if (categoryResult.error) setError(categoryResult.error.message);
    else setCategories((categoryResult.data ?? []) as Category[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadData().catch(() => { setError("We couldn't calculate your insights. Please refresh and try again."); setLoading(false); });
  }, [loadData]);

  const analysis = useMemo(() => {
    const now = new Date();
    const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const thisMonth = monthKey(now);
    const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonth = monthKey(previousDate);
    const monthTotals = new Map<string, { income: number; expenses: number }>();
    const categoryTotals = new Map<string, number>();

    for (const transaction of transactions) {
      const key = transaction.transaction_date.slice(0, 7);
      const current = monthTotals.get(key) ?? { income: 0, expenses: 0 };
      const value = Number(transaction.amount);
      if (transaction.type === "income") current.income += value;
      else {
        current.expenses += value;
        if (key === thisMonth) categoryTotals.set(transaction.category_id, (categoryTotals.get(transaction.category_id) ?? 0) + value);
      }
      monthTotals.set(key, current);
    }

    const current = monthTotals.get(thisMonth) ?? { income: 0, expenses: 0 };
    const previous = monthTotals.get(previousMonth) ?? { income: 0, expenses: 0 };
    const topCategory = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1])[0];
    const monthsWithExpenses = Array.from(monthTotals.entries()).filter(([, values]) => values.expenses > 0).sort(([a], [b]) => a.localeCompare(b));
    const completedMonths = monthsWithExpenses.filter(([key]) => key < thisMonth);
    const recentCompleted = completedMonths.slice(-3);
    const averageExpense = recentCompleted.length ? recentCompleted.reduce((sum, [, values]) => sum + values.expenses, 0) / recentCompleted.length : null;
    const expenseChange = previous.expenses > 0 ? ((current.expenses - previous.expenses) / previous.expenses) * 100 : null;
    const categoryName = topCategory ? categories.find((category) => category.id === topCategory[0])?.name ?? "Other category" : null;

    return { current, previous, topCategoryAmount: topCategory?.[1] ?? 0, categoryName, completedMonthCount: completedMonths.length, averageExpense, expenseChange };
  }, [transactions, categories]);

  const hasTransactions = transactions.length > 0;

  return (
    <div>
      <div><p className="text-sm font-medium text-[#147D52]">Patterns, not guesses</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Insights</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#68736C]">A helpful read of the transactions you've recorded, with clear notes on what the data can—and can't—tell us.</p></div>
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading ? <div className="mt-7 flex items-center justify-center gap-3 rounded-2xl border border-[#E6EBE7] bg-white py-20 text-sm text-[#68736C]"><LoaderCircle size={18} className="animate-spin" />Reviewing your records…</div> : !hasTransactions ? <div className="mt-7 rounded-2xl border border-dashed border-[#DDE4DE] bg-white px-5 py-16 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5F8EE] text-[#147D52]"><Sparkles size={22} /></span><h2 className="mt-4 text-lg font-bold">Your insights start with your first entry.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68736C]">Add transactions as you go. We'll start with straightforward summaries and only make comparisons when enough history is available.</p><Link href="/transactions?new=1" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#147D52] hover:underline">Add a transaction <ArrowRight size={16} /></Link></div> : <>
        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-[#E6EBE7] bg-white p-5"><div className="flex items-center gap-2 text-sm text-[#68736C]"><ArrowUpRight size={16} /> Expenses this month</div><p className="mt-3 text-2xl font-semibold tracking-tight">{money.format(analysis.current.expenses)}</p><p className="mt-2 text-xs text-[#7A847E]">Recorded in the current calendar month</p></article>
          <article className="rounded-2xl border border-[#E6EBE7] bg-white p-5"><div className="flex items-center gap-2 text-sm text-[#68736C]"><Lightbulb size={16} /> Largest expense category</div><p className="mt-3 truncate text-xl font-semibold tracking-tight">{analysis.categoryName ?? "No expenses yet"}</p><p className="mt-2 text-xs text-[#7A847E]">{analysis.categoryName ? money.format(analysis.topCategoryAmount) + " recorded this month" : "Add an expense to reveal a pattern"}</p></article>
          <article className="rounded-2xl border border-[#E6EBE7] bg-white p-5"><div className="flex items-center gap-2 text-sm text-[#68736C]"><TrendingUp size={16} /> Month-on-month change</div><p className="mt-3 text-2xl font-semibold tracking-tight">{analysis.expenseChange === null ? "Not available" : `${analysis.expenseChange > 0 ? "+" : ""}${analysis.expenseChange.toFixed(1)}%`}</p><p className="mt-2 text-xs text-[#7A847E]">{analysis.expenseChange === null ? "Need expenses in the previous month for comparison" : analysis.expenseChange > 0 ? "Recorded spending is higher than last month" : analysis.expenseChange < 0 ? "Recorded spending is lower than last month" : "Same recorded spending as last month"}</p></article>
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-2">
          <article className="rounded-2xl border border-[#E6EBE7] bg-white p-6 sm:p-7"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5F8EE] text-[#147D52]"><Sparkles size={20} /></span><h2 className="mt-5 text-lg font-bold">What your records say</h2>
            {analysis.categoryName ? <div className="mt-4 rounded-xl bg-[#F5F7F5] p-4"><p className="text-sm leading-6 text-[#56615A]"><strong>{analysis.categoryName}</strong> is your largest recorded expense category this month at <strong>{money.format(analysis.topCategoryAmount)}</strong>. If this feels higher than expected, review the transactions in that category before changing your budget.</p></div> : <p className="mt-4 text-sm leading-6 text-[#68736C]">There are no expense records this month yet, so we can't identify a leading category.</p>}
            {analysis.expenseChange !== null && <div className="mt-3 rounded-xl bg-[#F5F7F5] p-4"><p className="text-sm leading-6 text-[#56615A]">Your recorded expenses are <strong>{Math.abs(analysis.expenseChange).toFixed(1)}% {analysis.expenseChange > 0 ? "higher" : analysis.expenseChange < 0 ? "lower" : "unchanged"}</strong> compared with last month. This is a comparison of entries, not a judgment about whether spending was necessary.</p></div>}
            {!analysis.categoryName && analysis.expenseChange === null && <p className="mt-4 text-sm leading-6 text-[#68736C]">Record income and expenses over time to unlock more meaningful comparisons. We won't invent patterns when the evidence isn't there.</p>}
          </article>
          <article className="rounded-2xl border border-[#E6EBE7] bg-white p-6 sm:p-7"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF3E2] text-[#A76722]"><CalendarClock size={20} /></span><h2 className="mt-5 text-lg font-bold">Expense forecast readiness</h2>
            {analysis.averageExpense !== null ? <><p className="mt-2 text-sm leading-6 text-[#68736C]">You've recorded expenses in {analysis.completedMonthCount} completed month(s). Across the last {Math.min(3, analysis.completedMonthCount)} completed month(s), average recorded spending was:</p><p className="mt-4 text-2xl font-semibold text-[#147D52]">{money.format(analysis.averageExpense)}<span className="ml-2 text-sm font-medium text-[#7A847E]">per month</span></p><p className="mt-3 text-xs leading-5 text-[#7A847E]">This is a simple historical average, not a guarantee or a personalized AI forecast. Unusual months and missing entries can change the result.</p></> : <><p className="mt-2 text-sm leading-6 text-[#68736C]">A useful forecast needs more than a few isolated transactions. Once you've recorded expenses across at least two completed months, BudgetEase can show a simple baseline average.</p><div className="mt-5 rounded-xl bg-[#F5F7F5] p-4"><p className="text-sm font-semibold text-[#303A33]">{analysis.completedMonthCount} completed month(s) with expenses recorded</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E6EBE7]"><div className="h-full rounded-full bg-[#42D99A]" style={{ width: `${Math.min(analysis.completedMonthCount / 2 * 100, 100)}%` }} /></div><p className="mt-2 text-xs text-[#7A847E]">We'll be clear when there isn't enough history yet.</p></div></>}
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-[#E6EBE7] bg-white p-6"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5F7F5] text-[#68736C]"><ShieldAlert size={19} /></span><div><h2 className="font-bold">A note on accuracy</h2><p className="mt-2 text-sm leading-6 text-[#68736C]">These summaries are calculated from the records you enter. They may miss cash purchases or other activity you haven't logged. A month-to-month difference doesn't explain why it happened, and historical averages aren't guaranteed future results.</p></div></div></section>
      </>}
    </div>
  );
}
