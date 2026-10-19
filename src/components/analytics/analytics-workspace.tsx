"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, BarChart3, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Transaction = { id: string; category_id: string; type: "income" | "expense"; amount: number | string; transaction_date: string };
type Category = { id: string; name: string; type: "income" | "expense"; color: string };
const palette = ["#147D52", "#42D99A", "#E5A64A", "#5286D8", "#B36BC8", "#D36B70", "#6D9B83", "#E89B43", "#7A847E"];
const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const compactMoney = (value: number) => value >= 1000000 ? `₦${(value / 1000000).toFixed(1)}m` : value >= 1000 ? `₦${(value / 1000).toFixed(0)}k` : `₦${value}`;

export function AnalyticsWorkspace({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [period, setPeriod] = useState("6");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const [transactionResult, categoryResult] = await Promise.all([
      supabase.from("transactions").select("id,category_id,type,amount,transaction_date").eq("user_id", userId).order("transaction_date", { ascending: true }).limit(10000),
      supabase.from("categories").select("id,name,type,color"),
    ]);
    if (transactionResult.error) setError(transactionResult.error.message);
    else setTransactions((transactionResult.data ?? []) as Transaction[]);
    if (categoryResult.error) setError(categoryResult.error.message);
    else setCategories((categoryResult.data ?? []) as Category[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadData().catch(() => { setError("We couldn't load your analytics. Please refresh and try again."); setLoading(false); });
  }, [loadData]);

  const visible = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - Number(period) + 1, 1);
    return transactions.filter((transaction) => new Date(`${transaction.transaction_date}T00:00:00`) >= start);
  }, [transactions, period]);

  const summary = useMemo(() => visible.reduce((totals, transaction) => {
    const amount = Number(transaction.amount);
    if (transaction.type === "income") totals.income += amount;
    else totals.expenses += amount;
    return totals;
  }, { income: 0, expenses: 0 }), [visible]);

  const monthly = useMemo(() => {
    const months: { key: string; label: string; income: number; expenses: number }[] = [];
    const now = new Date();
    for (let offset = Number(period) - 1; offset >= 0; offset--) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.push({ key, label: date.toLocaleDateString("en-NG", { month: "short" }), income: 0, expenses: 0 });
    }
    for (const transaction of visible) {
      const key = transaction.transaction_date.slice(0, 7);
      const month = months.find((item) => item.key === key);
      if (!month) continue;
      if (transaction.type === "income") month.income += Number(transaction.amount);
      else month.expenses += Number(transaction.amount);
    }
    return months;
  }, [visible, period]);

  const categoryData = useMemo(() => {
    const sums = new Map<string, number>();
    visible.filter((transaction) => transaction.type === "expense").forEach((transaction) => {
      sums.set(transaction.category_id, (sums.get(transaction.category_id) ?? 0) + Number(transaction.amount));
    });
    return Array.from(sums.entries()).map(([id, value]) => ({
      id,
      name: categories.find((category) => category.id === id)?.name ?? "Other category",
      value,
    })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [visible, categories]);

  const monthCount = monthly.filter((month) => month.income > 0 || month.expenses > 0).length;

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#147D52]">Your patterns, made visible</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Analytics</h1><p className="mt-2 text-sm leading-6 text-[#68736C]">Explore the income and expenses you've recorded.</p></div><label className="flex items-center gap-3 self-start text-sm font-semibold text-[#56615A] sm:self-auto">Period<select value={period} onChange={(event) => setPeriod(event.target.value)} className="rounded-xl border border-[#DDE4DE] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#147D52]"><option value="3">Last 3 months</option><option value="6">Last 6 months</option><option value="12">Last 12 months</option></select></label></div>

      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading ? <div className="mt-7 flex items-center justify-center gap-3 rounded-2xl border border-[#E6EBE7] bg-white py-20 text-sm text-[#68736C]"><LoaderCircle size={18} className="animate-spin" />Building your analytics…</div> : visible.length === 0 ? <div className="mt-7 rounded-2xl border border-dashed border-[#DDE4DE] bg-white px-5 py-16 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5F8EE] text-[#147D52]"><BarChart3 size={22} /></span><h2 className="mt-4 text-lg font-bold">Your patterns will appear here.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68736C]">Add a few transactions and we'll turn your records into monthly trends and category breakdowns.</p></div> : <>
        <section className="mt-7 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-[#E6EBE7] bg-white p-5"><div className="flex items-center gap-2 text-sm text-[#68736C]"><ArrowDownRight size={16} className="text-[#147D52]" /> Total income</div><p className="mt-3 text-2xl font-semibold tracking-tight">{money.format(summary.income)}</p><p className="mt-2 text-xs text-[#7A847E]">Across selected period</p></article>
          <article className="rounded-2xl border border-[#E6EBE7] bg-white p-5"><div className="flex items-center gap-2 text-sm text-[#68736C]"><ArrowUpRight size={16} className="text-[#B36B28]" /> Total expenses</div><p className="mt-3 text-2xl font-semibold tracking-tight">{money.format(summary.expenses)}</p><p className="mt-2 text-xs text-[#7A847E]">Across selected period</p></article>
          <article className="rounded-2xl border border-[#E6EBE7] bg-white p-5"><div className="flex items-center gap-2 text-sm text-[#68736C]"><BarChart3 size={16} className="text-[#147D52]" /> Net cash flow</div><p className={`mt-3 text-2xl font-semibold tracking-tight ${summary.income - summary.expenses < 0 ? "text-[#B44A4A]" : "text-[#147D52]"}`}>{money.format(summary.income - summary.expenses)}</p><p className="mt-2 text-xs text-[#7A847E]">{monthCount} month(s) with activity · not a bank balance</p></article>
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <article className="min-w-0 rounded-2xl border border-[#E6EBE7] bg-white p-5 sm:p-6"><h2 className="font-bold">Income vs. expenses</h2><p className="mt-1 text-sm text-[#7A847E]">Monthly totals in the selected period</p><div className="mt-5 h-[300px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthly} margin={{ top: 8, right: 6, left: -12, bottom: 0 }}><CartesianGrid stroke="#EEF1EE" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#7A847E", fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#7A847E", fontSize: 11 }} tickFormatter={compactMoney} /><Tooltip formatter={(value) => money.format(Number(value))} contentStyle={{ borderRadius: 12, borderColor: "#E6EBE7", fontSize: 12 }} /><Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} /><Bar dataKey="income" name="Income" fill="#147D52" radius={[5, 5, 0, 0]} maxBarSize={28} /><Bar dataKey="expenses" name="Expenses" fill="#42D99A" radius={[5, 5, 0, 0]} maxBarSize={28} /></BarChart></ResponsiveContainer></div></article>
          <article className="min-w-0 rounded-2xl border border-[#E6EBE7] bg-white p-5 sm:p-6"><h2 className="font-bold">Where expenses go</h2><p className="mt-1 text-sm text-[#7A847E]">Top categories by recorded spend</p>{categoryData.length === 0 ? <p className="py-20 text-center text-sm text-[#7A847E]">No expense categories to chart yet.</p> : <><div className="mt-3 h-[220px] w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>{categoryData.map((item, index) => <Cell key={item.id} fill={palette[index % palette.length]} />)}</Pie><Tooltip formatter={(value) => money.format(Number(value))} contentStyle={{ borderRadius: 12, borderColor: "#E6EBE7", fontSize: 12 }} /></PieChart></ResponsiveContainer></div><div className="space-y-3">{categoryData.slice(0, 5).map((item, index) => <div key={item.id} className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: palette[index % palette.length] }} /><span className="min-w-0 flex-1 truncate text-xs text-[#68736C]">{item.name}</span><span className="text-xs font-bold">{money.format(item.value)}</span></div>)}</div></>}</article>
        </section>
        <p className="mt-5 text-center text-xs leading-5 text-[#929B95]">Analytics are calculated from your saved transactions. Incomplete records may not reflect all of your finances.</p>
      </>}
    </div>
  );
}
