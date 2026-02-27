create table if not exists public.review_replies (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_reply_id uuid references public.review_replies(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists review_replies_review_id_idx
on public.review_replies (review_id, created_at asc);

create index if not exists review_replies_parent_reply_id_idx
on public.review_replies (parent_reply_id);

alter table public.review_replies enable row level security;

create policy "review_replies_select_authenticated"
on public.review_replies
for select
to authenticated
using (true);

create policy "review_replies_insert_owner"
on public.review_replies
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "review_replies_update_owner"
on public.review_replies
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "review_replies_delete_owner"
on public.review_replies
for delete
to authenticated
using (auth.uid() = user_id);
