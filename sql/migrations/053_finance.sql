-- Personal savings/spending tracker - income and expense transactions, each tagged with a
-- category, backing running-balance and category-breakdown mini-analytics on the Finance page.
create table if not exists finance_transactions (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  date         date not null,
  type         text not null default 'expense',
  category     text not null default 'Other',
  amount       numeric not null,
  description  text
);
create index if not exists finance_transactions_date_idx on finance_transactions (date);

-- Service-role only, like every other table. No public policies.
alter table finance_transactions enable row level security;
