-- NexaPay: Full schema + RLS policies
-- Run this in the Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  company_name text,
  email text not null,
  avatar_url text,
  stripe_customer_id text unique,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_subscription_id text unique,
  plan text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  email text not null,
  company text,
  phone text,
  address text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  invoice_number text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date date not null,
  due_date date not null,
  subtotal integer not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount integer not null default 0,
  discount_amount integer not null default 0,
  total integer not null default 0,
  notes text,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  paid_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null,
  unit_price integer not null,
  amount integer not null,
  sort_order integer not null default 0,
  created_at timestamptz default now() not null
);

create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  stripe_payment_intent_id text not null,
  amount integer not null,
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('succeeded', 'pending', 'failed')),
  paid_at timestamptz not null,
  created_at timestamptz default now() not null
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_clients_user_id on public.clients(user_id);
create index idx_invoices_user_id on public.invoices(user_id);
create index idx_invoices_client_id on public.invoices(client_id);
create index idx_invoices_status on public.invoices(status);
create index idx_invoice_items_invoice_id on public.invoice_items(invoice_id);
create index idx_payments_invoice_id on public.payments(invoice_id);
create index idx_payments_user_id on public.payments(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Subscriptions: users can view their own
create policy "Users can view own subscription"
  on public.subscriptions for select using (auth.uid() = user_id);

-- Clients: full CRUD on own clients
create policy "Users can view own clients"
  on public.clients for select using (auth.uid() = user_id);
create policy "Users can create own clients"
  on public.clients for insert with check (auth.uid() = user_id);
create policy "Users can update own clients"
  on public.clients for update using (auth.uid() = user_id);
create policy "Users can delete own clients"
  on public.clients for delete using (auth.uid() = user_id);

-- Invoices: full CRUD on own invoices
create policy "Users can view own invoices"
  on public.invoices for select using (auth.uid() = user_id);
create policy "Users can create own invoices"
  on public.invoices for insert with check (auth.uid() = user_id);
create policy "Users can update own invoices"
  on public.invoices for update using (auth.uid() = user_id);
create policy "Users can delete own invoices"
  on public.invoices for delete using (auth.uid() = user_id);

-- Invoice items: access through invoice ownership
create policy "Users can view own invoice items"
  on public.invoice_items for select
  using (exists (
    select 1 from public.invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()
  ));
create policy "Users can create own invoice items"
  on public.invoice_items for insert
  with check (exists (
    select 1 from public.invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()
  ));
create policy "Users can update own invoice items"
  on public.invoice_items for update
  using (exists (
    select 1 from public.invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()
  ));
create policy "Users can delete own invoice items"
  on public.invoice_items for delete
  using (exists (
    select 1 from public.invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()
  ));

-- Payments: users can view their own
create policy "Users can view own payments"
  on public.payments for select using (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile + free subscription on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.update_updated_at();

create trigger set_clients_updated_at
  before update on public.clients
  for each row execute function public.update_updated_at();

create trigger set_invoices_updated_at
  before update on public.invoices
  for each row execute function public.update_updated_at();
