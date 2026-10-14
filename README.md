# BudgetEase

BudgetEase is a web-based personal finance tracker that enables users to record, categorize, and analyze their daily financial transactions. It uses AI to detect spending habits and predict future expenses, helping users make informed financial decisions and achieve better financial discipline.

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS
- Supabase Auth and PostgreSQL (integration setup is next)
- Recharts for financial visualizations
- Vercel deployment

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add your Supabase project URL and anon key when Supabase is configured.

## Product principles

- Currency: Nigerian naira (NGN) for the MVP.
- Net cash flow means income minus expenses; it is not a bank balance.
- Financial metrics are calculated in application code. AI explanations must be grounded in those metrics.
- Forecasts should communicate assumptions and uncertainty, and avoid precise predictions when history is insufficient.
- Every user's financial records must be protected by database row-level security.

## Current status

The initial foundation adds the responsive marketing page, visual design tokens, and Next.js app structure. Authentication, database schema and policies, and signed-in product screens are the next implementation milestones.
