-- BudgetEase initial schema. Run with the Supabase CLI or paste into the SQL Editor.
-- All money amounts are stored as positive NGN values; transaction type determines direction.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  currency text not null default 'NGN' check (currency = 'NGN'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 50),
  type text not null check (type in ('income', 'expense')),
  icon text not null default 'circle',
  color text not null default '#147D52',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  constraint categories_default_owner_check check (not is_default or user_id is null),
  constraint categories_name_owner_unique unique (user_id, type, name)
);

create unique index if not exists categories_global_default_unique
  on public.categories (type, lower(name)) where user_id is null;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  type text not null check (type in ('income', 'expense')),
  amount numeric(14,2) not null check (amount > 0),
  description text not null default '' check (char_length(description) <= 160),
  transaction_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, transaction_date desc);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  month date not null check (extract(day from month) = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budgets_user_category_month_unique unique (user_id, category_id, month)
);

create index if not exists budgets_user_month_idx
  on public.budgets (user_id, month desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.validate_transaction_category()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.categories c
    where c.id = new.category_id
      and c.type = new.type
      and (c.user_id = new.user_id or (c.user_id is null and c.is_default))
  ) then
    raise exception 'Choose a category of the same type that belongs to your account.';
  end if;
  return new;
end;
$$;

drop trigger if exists transactions_validate_category on public.transactions;
create trigger transactions_validate_category
  before insert or update of user_id, category_id, type on public.transactions
  for each row execute procedure public.validate_transaction_category();

create or replace function public.validate_budget_category()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.categories c
    where c.id = new.category_id
      and c.type = 'expense'
      and (c.user_id = new.user_id or (c.user_id is null and c.is_default))
  ) then
    raise exception 'Budgets can only use expense categories available to your account.';
  end if;
  return new;
end;
$$;

drop trigger if exists budgets_validate_category on public.budgets;
create trigger budgets_validate_category
  before insert or update of user_id, category_id on public.budgets
  for each row execute procedure public.validate_budget_category();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories
  for each row execute procedure public.set_updated_at();
drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at before update on public.transactions
  for each row execute procedure public.set_updated_at();
drop trigger if exists budgets_set_updated_at on public.budgets;
create trigger budgets_set_updated_at before update on public.budgets
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

drop policy if exists "Users can view their profile" on public.profiles;
create policy "Users can view their profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users can view available categories" on public.categories;
create policy "Users can view available categories" on public.categories
  for select to authenticated using (user_id is null or auth.uid() = user_id);
drop policy if exists "Users can create their own categories" on public.categories;
create policy "Users can create their own categories" on public.categories
  for insert to authenticated with check (auth.uid() = user_id and is_default = false);
drop policy if exists "Users can update their own categories" on public.categories;
create policy "Users can update their own categories" on public.categories
  for update to authenticated using (auth.uid() = user_id and is_default = false)
  with check (auth.uid() = user_id and is_default = false);
drop policy if exists "Users can delete their own categories" on public.categories;
create policy "Users can delete their own categories" on public.categories
  for delete to authenticated using (auth.uid() = user_id and is_default = false);

drop policy if exists "Users can view their transactions" on public.transactions;
create policy "Users can view their transactions" on public.transactions
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can create their transactions" on public.transactions;
create policy "Users can create their transactions" on public.transactions
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update their transactions" on public.transactions;
create policy "Users can update their transactions" on public.transactions
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their transactions" on public.transactions;
create policy "Users can delete their transactions" on public.transactions
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can view their budgets" on public.budgets;
create policy "Users can view their budgets" on public.budgets
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can create their budgets" on public.budgets;
create policy "Users can create their budgets" on public.budgets
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update their budgets" on public.budgets;
create policy "Users can update their budgets" on public.budgets
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their budgets" on public.budgets;
create policy "Users can delete their budgets" on public.budgets
  for delete to authenticated using (auth.uid() = user_id);

-- Global defaults are intentionally read-only to regular users.
insert into public.categories (user_id, name, type, icon, color, is_default)
values
  (null, 'Food & dining', 'expense', 'utensils', '#E89B43', true),
  (null, 'Transport', 'expense', 'car-front', '#5286D8', true),
  (null, 'Shopping', 'expense', 'shopping-bag', '#B36BC8', true),
  (null, 'Bills & utilities', 'expense', 'receipt', '#D36B70', true),
  (null, 'Health', 'expense', 'heart-pulse', '#D36B70', true),
  (null, 'Education', 'expense', 'graduation-cap', '#5286D8', true),
  (null, 'Entertainment', 'expense', 'clapperboard', '#B36BC8', true),
  (null, 'Personal care', 'expense', 'sparkles', '#D58AB0', true),
  (null, 'Family & gifts', 'expense', 'gift', '#E89B43', true),
  (null, 'Housing', 'expense', 'house', '#5286D8', true),
  (null, 'Other expense', 'expense', 'circle-help', '#7A847E', true),
  (null, 'Salary', 'income', 'briefcase-business', '#147D52', true),
  (null, 'Freelance', 'income', 'laptop', '#147D52', true),
  (null, 'Business', 'income', 'store', '#147D52', true),
  (null, 'Gift received', 'income', 'gift', '#147D52', true),
  (null, 'Other income', 'income', 'circle-help', '#147D52', true)
on conflict do nothing;
