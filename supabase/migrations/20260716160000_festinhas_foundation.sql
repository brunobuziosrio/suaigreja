-- Fundação do produto Festinhas: dados isolados por conta e por edição do evento.
create table if not exists public.festa_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  event_page_id uuid references public.event_pages(id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft' check (status in ('draft','open','closed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.festa_stalls (
  id uuid primary key default gen_random_uuid(),
  festa_event_id uuid not null references public.festa_events(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  responsible_name text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.festa_products (
  id uuid primary key default gen_random_uuid(),
  festa_stall_id uuid not null references public.festa_stalls(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  price_cents integer not null check (price_cents >= 0),
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.festa_orders (
  id uuid primary key default gen_random_uuid(),
  festa_event_id uuid not null references public.festa_events(id) on delete cascade,
  stall_id uuid references public.festa_stalls(id) on delete set null,
  order_code text not null,
  status text not null default 'received' check (status in ('received','preparing','ready','delivered','cancelled')),
  payment_method text not null check (payment_method in ('pix','card','cash','credit')),
  total_cents integer not null check (total_cents >= 0),
  operator_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (festa_event_id, order_code)
);
create index if not exists idx_festa_events_account on public.festa_events(account_id, starts_at desc);
create index if not exists idx_festa_stalls_event on public.festa_stalls(festa_event_id);
create index if not exists idx_festa_products_stall on public.festa_products(festa_stall_id);
create index if not exists idx_festa_orders_event on public.festa_orders(festa_event_id, created_at desc);
alter table public.festa_events enable row level security;
alter table public.festa_stalls enable row level security;
alter table public.festa_products enable row level security;
alter table public.festa_orders enable row level security;
create policy "account members manage festa events" on public.festa_events for all using (public.is_account_member(account_id, auth.uid())) with check (public.is_account_member(account_id, auth.uid()));
create policy "account members manage festa stalls" on public.festa_stalls for all using (exists (select 1 from public.festa_events e where e.id = festa_stall_id and public.is_account_member(e.account_id, auth.uid()))) with check (exists (select 1 from public.festa_events e where e.id = festa_stall_id and public.is_account_member(e.account_id, auth.uid())));
create policy "account members manage festa products" on public.festa_products for all using (exists (select 1 from public.festa_stalls s join public.festa_events e on e.id = s.festa_event_id where s.id = festa_stall_id and public.is_account_member(e.account_id, auth.uid()))) with check (exists (select 1 from public.festa_stalls s join public.festa_events e on e.id = s.festa_event_id where s.id = festa_stall_id and public.is_account_member(e.account_id, auth.uid())));
create policy "account members manage festa orders" on public.festa_orders for all using (exists (select 1 from public.festa_events e where e.id = festa_event_id and public.is_account_member(e.account_id, auth.uid()))) with check (exists (select 1 from public.festa_events e where e.id = festa_event_id and public.is_account_member(e.account_id, auth.uid())));
