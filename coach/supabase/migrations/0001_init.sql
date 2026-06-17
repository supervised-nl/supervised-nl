-- Supervised Coach — initieel schema + RLS
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tabellen
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  size text check (size in ('1-5', '5-15', '15-50', '50+')),
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  role text not null check (role in ('super_admin', 'admin', 'member')),
  name text,
  email text,
  created_at timestamptz not null default now()
);

create table public.workshop_contexts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  processes text,
  tools_used text,
  use_cases text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  workshop_context_id uuid references public.workshop_contexts (id) on delete set null,
  week_number integer not null,
  title text not null,
  description text not null,
  expected_outcome text,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed')),
  send_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.challenge_completions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  completed_at timestamptz not null default now(),
  shared_prompt text,
  shared_result text,
  time_saved_minutes integer,
  unique (challenge_id, user_id)
);

create table public.qa_threads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  question text not null,
  answer text,
  workshop_context_id uuid references public.workshop_contexts (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexen op foreign keys die door RLS-policies en dashboards gefilterd worden
-- ---------------------------------------------------------------------------

create index users_organization_id_idx on public.users (organization_id);
create index workshop_contexts_organization_id_idx on public.workshop_contexts (organization_id);
create index challenges_organization_id_idx on public.challenges (organization_id);
create index challenge_completions_organization_id_idx on public.challenge_completions (organization_id);
create index challenge_completions_challenge_id_idx on public.challenge_completions (challenge_id);
create index qa_threads_organization_id_idx on public.qa_threads (organization_id);

-- ---------------------------------------------------------------------------
-- RLS-helper: security definer zodat een policy op `users` zichzelf mag
-- raadplegen zonder infinite recursion (standaard Supabase-patroon).
-- ---------------------------------------------------------------------------

create function public.current_org_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select organization_id from public.users where id = auth.uid();
$$;

grant execute on function public.current_org_id() to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- super_admin heeft geen policy hieronder: die werkt via de service-role key
-- in server actions, die RLS altijd bypassed (Supabase-standaardgedrag).
-- ---------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.workshop_contexts enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_completions enable row level security;
alter table public.qa_threads enable row level security;

-- organizations: admin + member lezen alleen hun eigen organization
create policy "organizations_select_own" on public.organizations
  for select to authenticated
  using (id = public.current_org_id());

-- users: admin + member lezen alleen gebruikers binnen hun eigen organization
create policy "users_select_own_org" on public.users
  for select to authenticated
  using (organization_id = public.current_org_id());

-- workshop_contexts: alleen lezen (aanmaken/bewerken is super-admin via service role)
create policy "workshop_contexts_select_own_org" on public.workshop_contexts
  for select to authenticated
  using (organization_id = public.current_org_id());

-- challenges: alleen lezen (genereren/activeren is super-admin via service role)
create policy "challenges_select_own_org" on public.challenges
  for select to authenticated
  using (organization_id = public.current_org_id());

-- challenge_completions: lezen binnen eigen organization, zelf afvinken
create policy "challenge_completions_select_own_org" on public.challenge_completions
  for select to authenticated
  using (organization_id = public.current_org_id());

create policy "challenge_completions_insert_own" on public.challenge_completions
  for insert to authenticated
  with check (
    organization_id = public.current_org_id()
    and user_id = auth.uid()
  );

-- qa_threads: lezen binnen eigen organization, zelf vragen stellen
create policy "qa_threads_select_own_org" on public.qa_threads
  for select to authenticated
  using (organization_id = public.current_org_id());

create policy "qa_threads_insert_own" on public.qa_threads
  for insert to authenticated
  with check (
    organization_id = public.current_org_id()
    and user_id = auth.uid()
  );
