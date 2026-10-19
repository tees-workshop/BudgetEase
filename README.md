# BudgetEase

BudgetEase is a personal finance tracker for recording, categorizing, and understanding everyday money decisions. The MVP uses Nigerian naira (NGN), manual transaction entry, monthly category budgets, and evidence-based summaries.

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS v4
- Supabase Auth and PostgreSQL with row-level security
- Recharts for financial visualizations
- GitHub Actions for type, lint, and build checks
- Vercel-ready deployment configuration

## Getting started

1. Install Node.js 20 or newer.
2. Install dependencies and start the development server:

   ```bash
   npm install
   npm run dev
   ```

3. Copy `.env.example` to `.env.local` and fill in your Supabase project's URL and public anon/publishable key:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
   ```

   Never put a Supabase service-role key in a `NEXT_PUBLIC_*` variable or in browser code.

4. In your Supabase project, open **SQL Editor** and run `supabase/migrations/20261019000000_initial_schema.sql`. This creates the profile, category, transaction, and budget tables; account-isolation policies; category validation; and default categories.
5. In Supabase **Authentication → URL Configuration**, set your local site URL (for example, `http://localhost:3000`) and allow the redirect URL `http://localhost:3000/auth/callback`. Add your production domain's matching callback URL before deploying.
6. Enable the email/password provider in Supabase Auth. For local testing, follow the email-confirmation settings configured for your project.

## Available scripts

- `npm run dev` — start local development
- `npm run typecheck` — TypeScript check
- `npm run lint` — ESLint
- `npm run build` — production build

## Current product scope

Implemented in this foundation branch:
- Responsive public landing page and account screens
- Email/password registration and login UI, email confirmation callback, and password reset flow
- First-time profile onboarding and account settings
- Responsive signed-in navigation and dashboard summary
- Manual transaction creation, editing, deletion, search, and filters
- Monthly category budgets with spending progress
- Income/expense analytics charts and deterministic, evidence-based insights

Still to complete:
- Run and resolve the automated checks against the latest branch head
- Configure a real Supabase project and verify end-to-end auth/database flows
- Add AI-generated explanations and more complete forecasting after the data flows are validated
- Final deployment and production security review

## Product and data principles

- Currency is NGN for this MVP.
- Net cash flow is income minus expenses; it is not a bank balance.
- Financial metrics are computed from saved transactions, not invented by an AI model.
- Forecasts must explain assumptions and uncertainty; insufficient history must be stated clearly.
- Row-level security protects user-owned data. Do not expose service-role credentials.
- All financial records are manually entered in this version; there is no bank connection.

## Contributing

Changes are being developed on `feat/budgetease-foundation` and proposed through [pull request #1](https://github.com/tees-workshop/BudgetEase/pull/1). Do not merge or deploy until CI and the Supabase setup have been checked.
