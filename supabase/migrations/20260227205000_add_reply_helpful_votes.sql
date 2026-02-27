create table if not exists public.reply_helpful_votes (
  id uuid primary key default gen_random_uuid(),
  reply_id uuid not null references public.review_replies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (reply_id, user_id)
);

create index if not exists reply_helpful_votes_reply_id_idx
on public.reply_helpful_votes (reply_id);

alter table public.reply_helpful_votes enable row level security;

create policy "reply_helpful_votes_select_authenticated"
on public.reply_helpful_votes
for select
to authenticated
using (true);

create policy "reply_helpful_votes_insert_owner_verified"
on public.reply_helpful_votes
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "reply_helpful_votes_delete_owner"
on public.reply_helpful_votes
for delete
to authenticated
using (auth.uid() = user_id);
