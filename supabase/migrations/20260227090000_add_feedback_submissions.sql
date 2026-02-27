create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  message text not null check (char_length(trim(message)) between 1 and 4000),
  page_path text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists feedback_submissions_created_at_idx
on public.feedback_submissions (created_at desc);

create index if not exists feedback_submissions_user_id_idx
on public.feedback_submissions (user_id);

alter table public.feedback_submissions enable row level security;

create policy "feedback_submissions_insert_anon"
on public.feedback_submissions
for insert
to anon
with check (user_id is null);

create policy "feedback_submissions_insert_authenticated"
on public.feedback_submissions
for insert
to authenticated
with check (user_id is null or auth.uid() = user_id);
