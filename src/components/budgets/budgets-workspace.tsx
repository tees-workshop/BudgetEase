"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, LoaderCircle, Plus, Target, Trash2, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Category = { id: string; name: string; type: "income" | "expense"; color: string };
type Budget = { id: string; category_id: string; amount: number | string; month: string };
type Transaction = { category_id: string; amount: number | string; type: "income" | "expense"; transaction_date: string };

const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
};

export function BudgetsWorkspace({ userId }: { userId: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(currentMonth());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const [categoryResult, budgetResult, transactionResult] = await Promise.all([
      supabase.from("categories").select("id,name,type,color").eq("type", "expense").order("name"),
      supabase.from("budgets").select("id,category_id,amount,month").eq("user_id", userId).order("month", { ascending: false }),
      supabase.from("transactions").select("category_id,amount,type,transaction_date").eq("user_id", userId).eq("type", "expense").limit(5000),
    ]);
    if (categoryResult.error) setError(categoryResult.error.message);
    else setCategories((categoryResult.data ?? []) as Category[]);
    if (budgetResult.error) setError(budgetResult.error.message);
    else setBudgets((budgetResult.data ?? []) as Budget[]);
    if (transactionResult.error) setError(transactionResult.error.message);
    else setTransactions((transactionResult.data ?? []) as Transaction[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadData().catch(() => {
      setError("We couldn't load your budgets. Please refresh and try again.");
      setLoading(false);
    });
  }, [loadData]);

  const visibleBudgets = useMemo(() => budgets.filter((budget) => budget.month === month), [budgets, month]);
  const spentFor = (category: string) => transactions.reduce((sum, transaction) => transaction.category_id === category && transaction.transaction_date.startsWith(month.slice(0, 7)) ? sum + Number(transaction.amount) : sum, 0);
  const totalBudget = visibleBudgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
  const totalSpent = visibleBudgets.reduce((sum, budget) => sum + spentFor(budget.category_id), 0);
  const categoriesWithoutBudget = categories.filter((category) => !visibleBudgets.some((budget) => budget.category_id === category.id));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!categoryId || Number(amount) <= 0 || !Number.isFinite(Number(amount))) {
      setError("Choose an expense category and enter a budget amount greater than zero.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const normalizedMonth = `${month.slice(0, 7)}-01`;
      const { error: saveError } = await supabase.from("budgets").upsert({
        user_id: userId,
        category_id: categoryId,
        amount: Number(amount),
        month: normalizedMonth,
      }, { onConflict: "user_id,category_id,month" });
      if (saveError) throw saveError;
      await loadData();
      setNotice("Monthly budget saved.");
      setAmount("");
      setCategoryId("");
      setFormOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't save this budget. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBudget(budget: Budget) {
    if (!window.confirm("Delete this monthly budget?")) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("budgets").delete().eq("id", budget.id).eq("user_id", userId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setBudgets((items) => items.filter((item) => item.id !== budget.id));
    setNotice("Budget deleted.");
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#147D52]">Plan with intention</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Budgets</h1><p className="mt-2 text-sm leading-6 text-[#68736C]">Set a limit for the spending categories that matter to you.</p></div><button type="button" onClick={() => setFormOpen((open) => !open)} className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#147D52] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#106743] sm:self-auto"><Plus size={17} /> {formOpen ? "Close form" : "Create a budget"}</button></div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-[#E6EBE7] bg-white p-5"><p className="text-sm text-[#68736C]">Planned this month</p><p className="mt-3 text-2xl font-semibold tracking-tight">{money.format(totalBudget)}</p><p className="mt-2 text-xs text-[#7A847E]">{visibleBudgets.length} {visibleBudgets.length === 1 ? "category" : "categories"} budgeted</p></article>
        <article className="rounded-2xl border border-[#E6EBE7] bg-white p-5"><p className="text-sm text-[#68736C]">Spent in budgeted categories</p><p className="mt-3 text-2xl font-semibold tracking-tight">{money.format(totalSpent)}</p><p className="mt-2 text-xs text-[#7A847E]">Based on recorded expenses this month</p></article>
        <article className="rounded-2xl border border-[#E6EBE7] bg-white p-5"><p className="text-sm text-[#68736C]">Remaining across budgets</p><p className={`mt-3 text-2xl font-semibold tracking-tight ${totalBudget - totalSpent < 0 ? "text-[#B44A4A]" : "text-[#147D52]"}`}>{money.format(totalBudget - totalSpent)}</p><p className="mt-2 text-xs text-[#7A847E]">Planned amount minus recorded spend</p></article>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#E6EBE7] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h2 className="font-bold">Monthly overview</h2><p className="mt-1 text-sm text-[#7A847E]">Choose a month to view or set its limits.</p></div><input aria-label="Budget month" type="month" value={month.slice(0, 7)} onChange={(event) => event.target.value && setMonth(`${event.target.value}-01`)} className="rounded-xl border border-[#DDE4DE] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#147D52]" /></div>

      {formOpen && <form onSubmit={handleSubmit} className="mt-5 grid gap-4 rounded-2xl border border-[#C7EED9] bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><div><label htmlFor="budgetCategory" className="mb-2 block text-sm font-semibold">Expense category</label><select id="budgetCategory" required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="w-full rounded-xl border border-[#DDE4DE] bg-white px-3 py-3 text-sm outline-none focus:border-[#147D52]"><option value="">Choose category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}{visibleBudgets.some((budget) => budget.category_id === category.id) ? " (update existing)" : ""}</option>)}</select></div><div><label htmlFor="budgetAmount" className="mb-2 block text-sm font-semibold">Monthly limit (₦)</label><input id="budgetAmount" type="number" min="0.01" step="0.01" max="999999999999.99" required value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="e.g. 50000" className="w-full rounded-xl border border-[#DDE4DE] px-3 py-3 text-sm outline-none focus:border-[#147D52]" /></div><button type="submit" disabled={saving || categories.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D52] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />}{saving ? "Saving…" : "Save budget"}</button><p className="text-xs leading-5 text-[#7A847E] sm:col-span-3">Saving a category already budgeted for this month updates its limit.</p></form>}

      {notice && <p role="status" className="mt-5 flex items-center gap-2 rounded-xl border border-[#C7EED9] bg-[#EFFBF4] px-4 py-3 text-sm text-[#176B48]"><Check size={16} />{notice}</p>}
      {error && <p role="alert" className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={16} />{error}</p>}

      {loading ? <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-[#E6EBE7] bg-white py-16 text-sm text-[#68736C]"><LoaderCircle size={18} className="animate-spin" />Loading budgets…</div> : visibleBudgets.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-[#DDE4DE] bg-white px-5 py-14 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5F8EE] text-[#147D52]"><Target size={22} /></span><h2 className="mt-4 text-lg font-bold">Give your money a plan.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68736C]">Create your first category budget to see how your recorded expenses compare with your plan.</p><button type="button" onClick={() => setFormOpen(true)} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#147D52] hover:underline"><Plus size={16} /> Create your first budget</button></div> : (
        <section className="mt-6"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">{new Date(`${month.slice(0, 7)}-01T00:00:00`).toLocaleDateString("en-NG", { month: "long", year: "numeric" })} categories</h2><span className="text-xs text-[#7A847E]">Actuals from transactions</span></div><div className="grid gap-4 lg:grid-cols-2">{visibleBudgets.map((budget) => { const category = categories.find((item) => item.id === budget.category_id); const spent = spentFor(budget.category_id); const limit = Number(budget.amount); const progress = limit > 0 ? (spent / limit) * 100 : 0; const over = progress > 100; return <article key={budget.id} className="rounded-2xl border border-[#E6EBE7] bg-white p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F7F5] text-[#147D52]"><Wallet size={19} /></span><div className="min-w-0"><h3 className="truncate font-bold">{category?.name ?? "Expense category"}</h3><p className="mt-1 text-xs text-[#7A847E]">Monthly spending limit</p></div></div><button type="button" onClick={() => deleteBudget(budget)} aria-label={`Delete ${category?.name ?? "category"} budget`} className="rounded-lg p-2 text-[#929B95] hover:bg-red-50 hover:text-red-700"><Trash2 size={16} /></button></div><div className="mt-6 flex items-end justify-between gap-3"><div><p className="text-xs text-[#7A847E]">Spent</p><p className={`mt-1 text-xl font-semibold ${over ? "text-[#B44A4A]" : "text-[#151A18]"}`}>{money.format(spent)}</p></div><div className="text-right"><p className="text-xs text-[#7A847E]">Budget</p><p className="mt-1 text-base font-semibold">{money.format(limit)}</p></div></div><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#EEF1EE]"><div className={`h-full rounded-full transition-all ${over ? "bg-[#D36B70]" : progress >= 80 ? "bg-[#E5A64A]" : "bg-[#42D99A]"}`} style={{ width: `${Math.min(progress, 100)}%` }} /></div><div className="mt-2 flex justify-between gap-3 text-xs"><span className={over ? "font-semibold text-[#B44A4A]" : "text-[#7A847E]"}>{Math.round(progress)}% used</span><span className={over ? "font-semibold text-[#B44A4A]" : "text-[#7A847E]"}>{over ? `${money.format(spent - limit)} over` : `${money.format(limit - spent)} left`}</span></div></article>; })}</div></section>
      )}
      {categoriesWithoutBudget.length > 0 && <div className="mt-6 rounded-2xl border border-[#E6EBE7] bg-white p-5"><h2 className="font-bold">Other categories</h2><p className="mt-1 text-sm text-[#68736C]">You haven't set a budget for these expense categories yet.</p><div className="mt-4 flex flex-wrap gap-2">{categoriesWithoutBudget.slice(0, 8).map((category) => <button key={category.id} type="button" onClick={() => { setCategoryId(category.id); setFormOpen(true); }} className="rounded-full border border-[#DDE4DE] px-3 py-2 text-xs font-semibold text-[#56615A] transition hover:border-[#147D52] hover:text-[#147D52]">{category.name}</button>)}</div></div>}
      <p className="mt-5 text-center text-xs leading-5 text-[#929B95]">Budget progress is based on expenses you've recorded in each category for the selected month.</p>
    </div>
  );
}
