-- Neurix AI Agent — Supabase schema (run in SQL editor when using cloud persistence)

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New conversation',
  ai_mode text not null default 'consultant',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  feedback text,
  created_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  filename text not null,
  analysis text,
  created_at timestamptz default now()
);

create table if not exists user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ai_mode text default 'consultant',
  updated_at timestamptz default now()
);

alter table conversations enable row level security;
alter table messages enable row level security;
alter table documents enable row level security;
alter table user_preferences enable row level security;

create policy "Users own conversations" on conversations
  for all using (auth.uid() = user_id);

create policy "Users own messages" on messages
  for all using (
    conversation_id in (select id from conversations where user_id = auth.uid())
  );

create policy "Users own documents" on documents
  for all using (auth.uid() = user_id);

create policy "Users own preferences" on user_preferences
  for all using (auth.uid() = user_id);
