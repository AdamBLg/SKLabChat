-- SKLabChat starter schema
-- Run this in Supabase SQL Editor after creating your Supabase project.

create extension if not exists "pgcrypto";

create type public.content_rating as enum ('pg13', 'adult');
create type public.message_role as enum ('user', 'assistant', 'system');
create type public.passcode_status as enum ('pending', 'approved', 'expired', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  content_rating public.content_rating not null default 'pg13',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.message_role not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table public.login_passcodes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  status public.passcode_status not null default 'pending',
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index chats_user_id_updated_at_idx on public.chats(user_id, updated_at desc);
create index messages_chat_id_created_at_idx on public.messages(chat_id, created_at asc);
create index login_passcodes_code_idx on public.login_passcodes(code);

alter table public.profiles enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.login_passcodes enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read own chats"
  on public.chats for select
  using (auth.uid() = user_id);

create policy "Users can create own chats"
  on public.chats for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chats"
  on public.chats for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read messages in own chats"
  on public.messages for select
  using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
        and chats.user_id = auth.uid()
    )
  );

create policy "Users can create messages in own chats"
  on public.messages for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
        and chats.user_id = auth.uid()
    )
  );

-- Passcode policies are intentionally conservative.
-- Use a future server route / edge function with the service role key to create and approve codes.
create policy "Authenticated users can approve their own passcode rows later"
  on public.login_passcodes for update
  using (auth.uid() = approved_by)
  with check (auth.uid() = approved_by);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
