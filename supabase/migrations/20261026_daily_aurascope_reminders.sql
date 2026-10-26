-- Daily Aurascope reminder list.
-- Apply this migration in Supabase SQL Editor before enabling signups.
create table if not exists public.aurascope_daily_reminders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null unique,
  confirmation_token text unique,
  unsubscribe_token text not null unique,
  consented_at timestamptz not null,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  constraint aurascope_daily_reminders_email_length check (char_length(email) between 3 and 254)
);

create index if not exists aurascope_daily_reminders_active_idx
  on public.aurascope_daily_reminders (created_at)
  where confirmed_at is not null and unsubscribed_at is null;

alter table public.aurascope_daily_reminders enable row level security;

-- No anon/authenticated policies are created. Public visitors use the server API;
-- the server alone accesses this table with the Supabase service key.
