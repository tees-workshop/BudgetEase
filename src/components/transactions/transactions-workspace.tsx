"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronDown, CircleAlert, Filter, LoaderCircle, Pencil, Plus, Search, Trash2, Wallet, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type TransactionType = "income" | "expense";
type Category = { id: string; name: string; type: TransactionType; icon: string; color: string };
type Transaction = {
  id: string;
  category_id: string;
  type: TransactionType;
  amount: number | string;
  description: string;
  transaction_date: string;
  created_at: string;
};

const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 });
const today = () => {
  const date = new Date();
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
};

export function TransactionsWorkspace({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(searchParams.get("new") === "1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(today());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const [categoryResult, transactionResult] = await Promise.all([
      supabase.from("categories").select("id,name,type,icon,color").order("name"),
      supabase.from("transactions").select("id,category_id,type,amount,description,transaction_date,created_at").eq("user_id", userId).order("transaction_date", { ascending: false }).order("created_at", { ascending: false }).limit(1000),
    ]);

    if (categoryResult.error) setError(categoryResult.error.message);
    else setCategories((categoryResult.data ?? []) as Category[]);

    if (transactionResult.error) setError(transactionResult.error.message);
    else setTransactions((transactionResult.data ?? []) as Transaction[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadData().catch(() => {
      setError("We couldn't load your transactions. Please refresh and try again.");
      setLoading(false);
    });
  }, [loadData]);

  const availableCategories = categories.filter((category) => category.type === type);
  const filteredTransactions = useMemo(() => transactions.filter((transaction) => {
    const categoryName = categories.find((category) => category.id === transaction.category_id)?.name ?? "";
    const matchesSearch = `${transaction.description} ${categoryName}`.toLowerCase().includes(search.toLowerCase().trim());
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesMonth = monthFilter === "all" || transaction.transaction_date.startsWith(monthFilter);
    return matchesSearch && matchesType && matchesMonth;
  }), [transactions, categories, search, typeFilter, monthFilter]);

  const totals = filteredTransactions.reduce((sum, transaction) => {
    const amountValue = Number(transaction.amount);
    if (transaction.type === "income") sum.income += amountValue;
    else sum.expenses += amountValue;
    return sum;
  }, { income: 0, expenses: 0 });

  function resetForm() {
    setEditingId(null);
    setType("expense");
    setAmount("");
    setCategoryId("");
    setDescription("");
    setTransactionDate(today());
    setFormOpen(false);
    setError("");
  }

  function startEdit(transaction: Transaction) {
    setEditingId(transaction.id);
    setType(transaction.type);
    setAmount(String(transaction.amount));
    setCategoryId(transaction.category_id);
    setDescription(transaction.description ?? "");
    setTransactionDate(transaction.transaction_date);
    setFormOpen(true);
    setError("");
    setNotice("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!categoryId) {
      setError("Choose a category before saving.");
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const values = {
        user_id: userId,
        category_id: categoryId,
        type,
        amount: numericAmount,
        description: description.trim(),
        transaction_date: transactionDate,
      };

      const result = editingId
        ? await supabase.from("transactions").update(values).eq("id", editingId).eq("user_id", userId)
        : await supabase.from("transactions").insert(values);

      if (result.error) throw result.error;
      await loadData();
      setNotice(editingId ? "Transaction updated." : "Transaction added.");
      resetForm();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't save this transaction. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTransaction(transaction: Transaction) {
    if (!window.confirm("Delete this transaction? This can't be undone.")) return;
    setError("");
    setNotice("");
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("transactions").delete().eq("id", transaction.id).eq("user_id", userId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setTransactions((current) => current.filter((item) => item.id !== transaction.id));
    setNotice("Transaction deleted.");
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-[#147D52]">Your money journal</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Transactions</h1><p className="mt-2 text-sm leading-6 text-[#68736C]">Keep track of money coming in and going out.</p></div>
        <button type="button" onClick={() => { setFormOpen((open) => !open); setEditingId(null); setError(""); }} className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#147D52] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#106743] sm:self-auto">{formOpen ? <X size={17} /> : <Plus size={17} />}{formOpen ? "Close form" : "Add transaction"}</button>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E6EBE7] bg-white p-5"><p className="text-sm text-[#68736C]">Filtered income</p><p className="mt-3 text-2xl font-semibold tracking-tight text-[#147D52]">{money.format(totals.income)}</p></div>
        <div className="rounded-2xl border border-[#E6EBE7] bg-white p-5"><p className="text-sm text-[#68736C]">Filtered expenses</p><p className="mt-3 text-2xl font-semibold tracking-tight">{money.format(totals.expenses)}</p></div>
        <div className="rounded-2xl border border-[#E6EBE7] bg-white p-5"><p className="text-sm text-[#68736C]">Net cash flow</p><p className="mt-3 text-2xl font-semibold tracking-tight">{money.format(totals.income - totals.expenses)}</p></div>
      </div>

      {formOpen && <section className="mt-6 rounded-2xl border border-[#C7EED9] bg-white p-5 sm:p-7"><div className="mb-6 flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold">{editingId ? "Edit transaction" : "Add a transaction"}</h2><p className="mt-1 text-sm text-[#68736C]">Enter the details as you know them. Amounts are in Nigerian naira.</p></div><button type="button" onClick={resetForm} aria-label="Close transaction form" className="rounded-lg p-2 text-[#68736C] hover:bg-[#F5F7F5]"><X size={18} /></button></div>
        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div className="sm:col-span-2 xl:col-span-3"><span className="mb-2 block text-sm font-semibold text-[#303A33]">Type</span><div className="grid max-w-md grid-cols-2 gap-2 rounded-xl bg-[#F5F7F5] p-1"><button type="button" onClick={() => { setType("expense"); setCategoryId(""); }} className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${type === "expense" ? "bg-white text-[#151A18] shadow-sm" : "text-[#7A847E]"}`}><ArrowUpRight size={16} />Expense</button><button type="button" onClick={() => { setType("income"); setCategoryId(""); }} className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${type === "income" ? "bg-white text-[#147D52] shadow-sm" : "text-[#7A847E]"}`}><ArrowDownRight size={16} />Income</button></div></div>
          <div><label htmlFor="amount" className="mb-2 block text-sm font-semibold text-[#303A33]">Amount (₦)</label><input id="amount" type="number" inputMode="decimal" min="0.01" max="999999999999.99" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className="w-full rounded-xl border border-[#DDE4DE] px-4 py-3 text-sm outline-none focus:border-[#147D52] focus:ring-4 focus:ring-[#147D52]/10" /></div>
          <div><label htmlFor="category" className="mb-2 block text-sm font-semibold text-[#303A33]">Category</label><div className="relative"><select id="category" required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="w-full appearance-none rounded-xl border border-[#DDE4DE] bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-[#147D52] focus:ring-4 focus:ring-[#147D52]/10"><option value="">Choose a category</option>{availableCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A847E]" /></div>{availableCategories.length === 0 && <p className="mt-2 text-xs text-[#A76722]">No categories found. Apply the database migration first.</p>}</div>
          <div><label htmlFor="transactionDate" className="mb-2 block text-sm font-semibold text-[#303A33]">Date</label><div className="relative"><input id="transactionDate" type="date" required max={today()} value={transactionDate} onChange={(event) => setTransactionDate(event.target.value)} className="w-full rounded-xl border border-[#DDE4DE] bg-white px-4 py-3 text-sm outline-none focus:border-[#147D52] focus:ring-4 focus:ring-[#147D52]/10" /><CalendarDays size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A847E]" /></div></div>
          <div className="sm:col-span-2 xl:col-span-3"><label htmlFor="description" className="mb-2 block text-sm font-semibold text-[#303A33]">Description <span className="font-normal text-[#929B95]">(optional)</span></label><input id="description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={160} placeholder={type === "income" ? "e.g. Monthly salary" : "e.g. Groceries for the week"} className="w-full rounded-xl border border-[#DDE4DE] px-4 py-3 text-sm outline-none focus:border-[#147D52] focus:ring-4 focus:ring-[#147D52]/10" /></div>
          {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2 xl:col-span-3"><CircleAlert size={17} className="mt-0.5 shrink-0" />{error}</p>}
          <div className="flex flex-wrap gap-3 sm:col-span-2 xl:col-span-3"><button type="submit" disabled={saving || availableCategories.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#106743] disabled:opacity-60">{saving ? <><LoaderCircle size={16} className="animate-spin" /> Saving…</> : <><Check size={16} />{editingId ? "Save changes" : "Save transaction"}</>}</button><button type="button" onClick={resetForm} className="rounded-xl border border-[#DDE4DE] px-5 py-3 text-sm font-semibold text-[#68736C] hover:bg-[#F5F7F5]">Cancel</button></div>
        </form>
      </section>}

      {notice && <p role="status" className="mt-5 flex items-center gap-2 rounded-xl border border-[#C7EED9] bg-[#EFFBF4] px-4 py-3 text-sm text-[#176B48]"><Check size={16} />{notice}</p>}
      {error && !formOpen && <p role="alert" className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"><CircleAlert size={16} />{error}</p>}

      <section className="mt-6 overflow-hidden rounded-2xl border border-[#E6EBE7] bg-white">
        <div className="border-b border-[#E6EBE7] p-4 sm:p-5"><div className="flex items-center gap-2"><Filter size={17} className="text-[#147D52]" /><h2 className="font-bold">Your activity</h2><span className="rounded-full bg-[#F5F7F5] px-2.5 py-1 text-xs font-semibold text-[#68736C]">{filteredTransactions.length}</span></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px_180px]">
            <label className="relative block"><span className="sr-only">Search transactions</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#929B95]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search description or category" className="w-full rounded-xl border border-[#DDE4DE] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#147D52] focus:ring-4 focus:ring-[#147D52]/10" /></label>
            <select aria-label="Filter by transaction type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "all" | TransactionType)} className="rounded-xl border border-[#DDE4DE] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#147D52]"><option value="all">All types</option><option value="expense">Expenses</option><option value="income">Income</option></select>
            <select aria-label="Filter by month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} className="rounded-xl border border-[#DDE4DE] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#147D52]"><option value="all">All months</option>{Array.from(new Set(transactions.map((transaction) => transaction.transaction_date.slice(0, 7)))).sort().reverse().map((month) => <option key={month} value={month}>{new Date(`${month}-01T00:00:00`).toLocaleDateString("en-NG", { month: "long", year: "numeric" })}</option>)}</select>
          </div>
        </div>
        {loading ? <div className="flex items-center justify-center gap-3 px-5 py-16 text-sm text-[#68736C]"><LoaderCircle size={18} className="animate-spin" />Loading your transactions…</div> : filteredTransactions.length === 0 ? <div className="px-5 py-14 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F7F5] text-[#68736C]"><Wallet size={22} /></span><h3 className="mt-4 font-bold">{transactions.length === 0 ? "No transactions yet" : "No matching transactions"}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#68736C]">{transactions.length === 0 ? "When you add income or expenses, they'll show up here." : "Try changing your search or filters to find what you're looking for."}</p>{transactions.length === 0 && <button type="button" onClick={() => setFormOpen(true)} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#147D52] hover:underline"><Plus size={16} /> Add your first transaction</button>}</div> : (
          <>
            <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[720px] text-left"><thead className="bg-[#FAFBFA] text-[11px] uppercase tracking-wider text-[#929B95]"><tr><th className="px-5 py-3 font-semibold">Description</th><th className="px-4 py-3 font-semibold">Category</th><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3 text-right font-semibold">Amount</th><th className="px-5 py-3 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-[#EEF1EE]">{filteredTransactions.map((transaction) => { const category = categories.find((item) => item.id === transaction.category_id); return <tr key={transaction.id} className="transition hover:bg-[#FAFBFA]"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${transaction.type === "income" ? "bg-[#E5F8EE] text-[#147D52]" : "bg-[#F5F7F5] text-[#68736C]"}`}>{transaction.type === "income" ? <ArrowDownRight size={17} /> : <ArrowUpRight size={17} />}</span><div><p className="max-w-[240px] truncate text-sm font-semibold">{transaction.description || category?.name || "Transaction"}</p><p className="mt-0.5 text-xs capitalize text-[#929B95]">{transaction.type}</p></div></div></td><td className="px-4 py-4"><span className="rounded-full bg-[#F5F7F5] px-2.5 py-1.5 text-xs font-medium text-[#56615A]">{category?.name ?? "Category"}</span></td><td className="px-4 py-4 text-sm text-[#68736C]">{new Date(`${transaction.transaction_date}T00:00:00`).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td><td className={`px-4 py-4 text-right text-sm font-bold ${transaction.type === "income" ? "text-[#147D52]" : "text-[#303A33]"}`}>{transaction.type === "income" ? "+" : "−"}{money.format(Number(transaction.amount))}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => startEdit(transaction)} aria-label="Edit transaction" className="rounded-lg p-2 text-[#68736C] hover:bg-[#E5F8EE] hover:text-[#147D52]"><Pencil size={15} /></button><button type="button" onClick={() => deleteTransaction(transaction)} aria-label="Delete transaction" className="rounded-lg p-2 text-[#68736C] hover:bg-red-50 hover:text-red-700"><Trash2 size={15} /></button></div></td></tr>; })}</tbody></table></div>
            <div className="divide-y divide-[#EEF1EE] md:hidden">{filteredTransactions.map((transaction) => { const category = categories.find((item) => item.id === transaction.category_id); return <div key={transaction.id} className="flex items-center gap-3 p-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${transaction.type === "income" ? "bg-[#E5F8EE] text-[#147D52]" : "bg-[#F5F7F5] text-[#68736C]"}`}>{transaction.type === "income" ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{transaction.description || category?.name || "Transaction"}</p><p className="mt-1 text-xs text-[#7A847E]">{category?.name ?? "Category"} · {new Date(`${transaction.transaction_date}T00:00:00`).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</p><p className={`mt-1 text-sm font-bold ${transaction.type === "income" ? "text-[#147D52]" : "text-[#303A33]"}`}>{transaction.type === "income" ? "+" : "−"}{money.format(Number(transaction.amount))}</p></div><div className="flex flex-col gap-1"><button type="button" onClick={() => startEdit(transaction)} aria-label="Edit transaction" className="rounded-lg p-2 text-[#68736C] hover:bg-[#E5F8EE] hover:text-[#147D52]"><Pencil size={15} /></button><button type="button" onClick={() => deleteTransaction(transaction)} aria-label="Delete transaction" className="rounded-lg p-2 text-[#68736C] hover:bg-red-50 hover:text-red-700"><Trash2 size={15} /></button></div></div>; })}</div>
          </>
        )}
      </section>
      <p className="mt-5 text-center text-xs leading-5 text-[#929B95]">Transactions are entered manually. Totals reflect the records you've saved in BudgetEase.</p>
    </div>
  );
}
