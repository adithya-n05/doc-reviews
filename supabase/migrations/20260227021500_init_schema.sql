-- Core extensions
create extension if not exists pgcrypto;

-- Utility trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null unique,
  year smallint,
  degree_track text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_year_check check (year is null or year between 1 and 4)
);

create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Module catalog
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null default '',
  source_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger trg_modules_updated_at
before update on public.modules
for each row
execute function public.set_updated_at();

create table if not exists public.module_leaders (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  leader_name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (module_id, leader_name)
);

create table if not exists public.module_offerings (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  academic_year_label text not null,
  study_year smallint not null,
  term text not null,
  offering_type text not null,
  degree_path text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint module_offerings_study_year_check check (study_year between 1 and 4),
  constraint module_offerings_term_check check (
    term in ('autumn', 'spring', 'summer', 'autumn_spring', 'full_year', 'unknown')
  ),
  constraint module_offerings_type_check check (
    offering_type in ('core', 'compulsory', 'elective', 'selective', 'extracurricular')
  ),
  unique (module_id, academic_year_label, study_year, term, offering_type, degree_path)
);

create trigger trg_module_offerings_updated_at
before update on public.module_offerings
for each row
execute function public.set_updated_at();

-- User module selections
create table if not exists public.user_modules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, module_id)
);

create index if not exists idx_user_modules_user_id on public.user_modules(user_id);
create index if not exists idx_user_modules_module_id on public.user_modules(module_id);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  teaching_rating smallint not null check (teaching_rating between 1 and 5),
  workload_rating smallint not null check (workload_rating between 1 and 5),
  difficulty_rating smallint not null check (difficulty_rating between 1 and 5),
  assessment_rating smallint not null check (assessment_rating between 1 and 5),
  comment text not null check (char_length(comment) >= 80),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (module_id, user_id)
);

create index if not exists idx_reviews_module_id on public.reviews(module_id);
create index if not exists idx_reviews_user_id on public.reviews(user_id);

create trigger trg_reviews_updated_at
before update on public.reviews
for each row
execute function public.set_updated_at();

-- Create profile row for new auth users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id)
  do update
  set email = excluded.email;

  return new;
end;
$$;

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = coalesce(new.email, email)
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
after update of email on auth.users
for each row
execute function public.sync_profile_email();

-- Aggregates view
create or replace view public.module_review_aggregates as
select
  r.module_id,
  count(*)::int as review_count,
  round(avg(r.teaching_rating)::numeric, 2) as avg_teaching,
  round(avg(r.workload_rating)::numeric, 2) as avg_workload,
  round(avg(r.difficulty_rating)::numeric, 2) as avg_difficulty,
  round(avg(r.assessment_rating)::numeric, 2) as avg_assessment,
  round(
    (
      avg(r.teaching_rating)
      + avg(r.workload_rating)
      + avg(r.difficulty_rating)
      + avg(r.assessment_rating)
    )::numeric / 4,
    2
  ) as avg_overall
from public.reviews r
group by r.module_id;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.module_leaders enable row level security;
alter table public.module_offerings enable row level security;
alter table public.user_modules enable row level security;
alter table public.reviews enable row level security;

-- Profiles policies
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Catalog policies
create policy "modules_select_authenticated"
on public.modules
for select
to authenticated
using (true);

create policy "module_leaders_select_authenticated"
on public.module_leaders
for select
to authenticated
using (true);

create policy "module_offerings_select_authenticated"
on public.module_offerings
for select
to authenticated
using (true);

-- User modules policies
create policy "user_modules_select_own"
on public.user_modules
for select
to authenticated
using (auth.uid() = user_id);

create policy "user_modules_insert_own"
on public.user_modules
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user_modules_delete_own"
on public.user_modules
for delete
to authenticated
using (auth.uid() = user_id);

-- Reviews policies
create policy "reviews_select_authenticated"
on public.reviews
for select
to authenticated
using (true);

create policy "reviews_insert_owner_verified"
on public.reviews
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  )
);

create policy "reviews_update_owner"
on public.reviews
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "reviews_delete_owner"
on public.reviews
for delete
to authenticated
using (auth.uid() = user_id);

-- View access
grant select on public.module_review_aggregates to authenticated;
