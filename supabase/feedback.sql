-- Run in Supabase SQL Editor to enable feedback storage.
-- Requires SUPABASE_SERVICE_ROLE_KEY on the server (API route).

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  email text,
  category text not null,
  page text,
  screen_width integer,
  screen_height integer,
  device_type text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;

-- No public policies: inserts go through the server API with the service role key.
