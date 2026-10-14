import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Leaf,
  Menu,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

const transactions = [
  { name: "Groceries", category: "Food & dining", date: "Today, 10:42 AM", amount: "−₦18,500", icon: "🛒", tone: "bg-orange-50" },
  { name: "Freelance project", category: "Income", date: "Yesterday", amount: "+₦85,000", icon: "↗", tone: "bg-emerald-50" },
  { name: "Ride to work", category: "Transport", date: "Oct 11, 2026", amount: "−₦4,200", icon: "🚗", tone: "bg-blue-50" },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="BudgetEase home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#147D52] text-white">
        <Leaf size={20} strokeWidth={2.5} />
      </span>
      <span className="text-lg font-bold tracking-[-0.04em] text-[#151A18]">BudgetEase<span className="text-[#147D52]">.</span></span>
    </Link>
  );
}

function MiniChart() {
  const heights = [27, 38, 31, 49, 43, 61, 51, 73, 57, 66, 48, 84, 68, 91, 73, 100, 82, 70, 89, 62, 77, 53, 67, 42];
  return (
    <div className="flex h-[116px] items-end gap-1.5" aria-label="Illustrative monthly spending trend">
      {heights.map((height, index) => (
        <div key={index} className="flex-1 rounded-t-[4px]" style={{ height: `${height}%`, background: index > 17 ? "#42D99A" : index > 12 ? "#8BE9BC" : "#D7F5E5" }} />
      ))}
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="soft-shadow relative mx-auto w-full max-w-[560px] rounded-[24px] border border-[#E6EBE7] bg-white p-4 sm:p-5 animate-float-in delay-150">
      <div className="mb-5 flex items-center justify-between border-b border-[#EEF1EE] pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E5F8EE] text-[#147D52]"><Wallet size={17} /></span>
          <div><p className="text-sm font-bold">Your overview</p><p className="text-[11px] text-[#78827C]">October 2026</p></div>
        </div>
        <span className="rounded-full bg-[#F5F7F5] px-3 py-1.5 text-[11px] font-medium text-[#6D7771]">This month <ChevronDown size={12} className="ml-1 inline" /></span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl bg-[#F5F7F5] p-3 sm:p-4"><p className="text-[10px] font-medium text-[#6D7771] sm:text-xs">Income</p><p className="mt-2 text-base font-bold tracking-tight sm:text-xl">₦320k</p><p className="mt-1 text-[10px] text-[#147D52]"><ArrowUpRight size={12} className="mr-0.5 inline" />12.8%</p></div>
        <div className="rounded-2xl bg-[#F5F7F5] p-3 sm:p-4"><p className="text-[10px] font-medium text-[#6D7771] sm:text-xs">Expenses</p><p className="mt-2 text-base font-bold tracking-tight sm:text-xl">₦142k</p><p className="mt-1 text-[10px] text-[#B36B28]"><ArrowDownRight size={12} className="mr-0.5 inline" />4.2%</p></div>
        <div className="rounded-2xl bg-[#E5F8EE] p-3 sm:p-4"><p className="text-[10px] font-medium text-[#147D52] sm:text-xs">Cash flow</p><p className="mt-2 text-base font-bold tracking-tight text-[#147D52] sm:text-xl">₦178k</p><p className="mt-1 text-[10px] text-[#147D52]">Looking good</p></div>
      </div>
      <div className="mt-4 rounded-2xl border border-[#EEF1EE] p-4">
        <div className="mb-3 flex items-center justify-between"><div><p className="text-xs font-bold">Spending over time</p><p className="mt-1 text-[10px] text-[#78827C]">A clearer picture, week by week</p></div><BarChart3 size={17} className="text-[#147D52]" /></div>
        <MiniChart />
        <div className="mt-2 flex justify-between text-[9px] text-[#8A938D]"><span>Oct 1</span><span>Oct 7</span><span>Oct 14</span><span>Oct 21</span><span>Oct 31</span></div>
      </div>
      <div className="mt-4 rounded-2xl border border-[#EEF1EE] p-4">
        <div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold">Recent activity</p><span className="text-[10px] font-semibold text-[#147D52]">View all</span></div>
        <div className="space-y-3">
          {transactions.map((transaction) => <div key={transaction.name} className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm ${transaction.tone}`}>{transaction.icon}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{transaction.name}</p><p className="mt-0.5 text-[10px] text-[#78827C]">{transaction.category}</p></div><div className={`text-xs font-bold ${transaction.amount.startsWith("+") ? "text-[#147D52]" : "text-[#151A18]"}`}>{transaction.amount}</div></div>)}
        </div>
      </div>
      <div className="absolute -right-3 top-24 hidden items-center gap-2 rounded-2xl border border-[#E6EBE7] bg-white px-3 py-2.5 shadow-lg sm:flex"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5F8EE] text-[#147D52]"><Sparkles size={16} /></span><div><p className="text-[11px] font-bold">A little insight</p><p className="text-[10px] text-[#6D7771]">You're building a good habit.</p></div></div>
    </div>
  );
}

const features = [
  { icon: CreditCard, title: "Know where it goes", text: "Log everyday spending in seconds and keep all your money movements in one simple place." },
  { icon: BarChart3, title: "See the bigger picture", text: "Understand your habits with clear summaries, category breakdowns, and monthly comparisons." },
  { icon: Sparkles, title: "Make smarter next moves", text: "Get thoughtful, data-backed insights and realistic expense forecasts—without the guesswork." },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <header className="relative z-10 border-b border-[#EEF1EE] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <Brand />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            <Link href="#features" className="text-sm font-medium text-[#56615A] transition hover:text-[#147D52]">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-[#56615A] transition hover:text-[#147D52]">How it works</Link>
            <Link href="#security" className="text-sm font-medium text-[#56615A] transition hover:text-[#147D52]">Your privacy</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden px-3 py-2 text-sm font-semibold text-[#3F4943] transition hover:text-[#147D52] sm:inline-flex">Log in</Link>
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-[#147D52] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106743] sm:px-5">Get started <ArrowRight size={15} /></Link>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="hero-grid pointer-events-none absolute inset-0 -z-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1fr_1fr] lg:gap-10 lg:px-12 lg:pb-28 lg:pt-24">
          <div className="animate-float-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D9EFE2] bg-white/90 px-3.5 py-2 text-xs font-semibold text-[#147D52]"><span className="h-2 w-2 rounded-full bg-[#42D99A]" /> A more mindful money routine</div>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.055em] text-[#151A18] sm:text-5xl lg:text-[64px]">Your money, <span className="text-[#147D52]">a little</span> more in control.</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#68736C] sm:text-lg sm:leading-8">Understand your spending, build a budget that feels realistic, and make your next money decision with more confidence.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#147D52] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#106743]">Start your free account <ArrowRight size={16} /></Link>
              <Link href="#features" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DDE4DE] bg-white px-6 py-3.5 text-sm font-semibold text-[#354039] transition hover:border-[#147D52]">Explore features <ArrowDownRight size={16} /></Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#69756D]"><span className="inline-flex items-center gap-1.5"><Check size={14} className="text-[#147D52]" /> Built for everyday life</span><span className="inline-flex items-center gap-1.5"><Check size={14} className="text-[#147D52]" /> Nigerian naira (₦)</span><span className="inline-flex items-center gap-1.5"><Check size={14} className="text-[#147D52]" /> Your money, your pace</span></div>
          </div>
          <div className="relative z-10 pt-2 lg:pl-4"><DashboardPreview /></div>
        </div>
      </section>

      <section id="features" className="border-y border-[#EEF1EE] bg-[#F5F7F5] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#147D52]">Less guessing, more knowing</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">A clearer view of your finances starts here.</h2><p className="mt-4 text-base leading-7 text-[#68736C]">The essentials to help you understand today, plan for tomorrow, and feel more in control along the way.</p></div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-3xl border border-[#E5EBE6] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5F8EE] text-[#147D52]"><Icon size={22} /></span><h3 className="mt-6 text-lg font-bold tracking-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-[#68736C]">{text}</p></article>)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-12">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#147D52]">Simple by design</p><h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Small money habits can add up to a big difference.</h2><p className="mt-5 max-w-lg leading-7 text-[#68736C]">You don't need to be a finance expert. Start with what you earn and spend, then let the patterns become easier to see.</p><Link href="/register" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#147D52] hover:gap-3">Take the first step <ArrowRight size={16} /></Link></div>
          <div className="space-y-4">
            {[{ n:"01", title:"Record what matters", body:"Add income and expenses as they happen, with categories that make sense to you." },{ n:"02", title:"Set a budget you can live with", body:"Choose monthly limits for the areas where you want a little more awareness." },{ n:"03", title:"Learn from your patterns", body:"Use your summaries and evidence-backed insights to plan your next month." }].map((step) => <div key={step.n} className="flex gap-5 rounded-2xl border border-[#E6EBE7] p-5 sm:p-6"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F7F5] text-sm font-bold text-[#147D52]">{step.n}</span><div><h3 className="font-bold">{step.title}</h3><p className="mt-1.5 text-sm leading-6 text-[#68736C]">{step.body}</p></div></div>)}
          </div>
        </div>
      </section>

      <section id="security" className="bg-[#151A18] py-16 text-white sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div className="max-w-2xl"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#42D99A]"><ShieldCheck size={22} /></span><h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">Your finances are personal. Your tools should respect that.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/65">BudgetEase is being built with individual accounts and private financial records in mind. Your data should only be accessible to you.</p></div>
          <Link href="/register" className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#42D99A] px-6 py-3.5 text-sm font-bold text-[#10271D] transition hover:bg-[#69E7B0] md:self-center">Create your account <ArrowRight size={16} /></Link>
        </div>
      </section>

      <footer className="border-t border-[#E6EBE7] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12"><Brand /><p className="text-xs text-[#7A847E]">© 2026 BudgetEase. A calmer relationship with money.</p><div className="flex items-center gap-4 text-xs text-[#69756D]"><Link href="/login" className="hover:text-[#147D52]">Log in</Link><Link href="/register" className="hover:text-[#147D52]">Get started</Link><span className="inline-flex items-center gap-1"><CircleHelp size={13} /> Made for real life</span></div></div>
      </footer>
    </main>
  );
}