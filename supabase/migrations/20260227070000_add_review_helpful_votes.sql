create table if not exists public.review_helpful_votes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (review_id, user_id)
);

alter table public.review_helpful_votes enable row level security;

create policy "review_helpful_votes_select_authenticated"
on public.review_helpful_votes
for select
to authenticated
using (true);

create policy "review_helpful_votes_insert_owner_verified"
on public.review_helpful_votes
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

create policy "review_helpful_votes_delete_owner"
on public.review_helpful_votes
for delete
to authenticated
using (auth.uid() = user_id);
