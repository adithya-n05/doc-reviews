-- Helpful vote writes are already guarded by verified-session checks in app/server code.
-- Keep RLS ownership enforcement without querying auth.users directly.

drop policy if exists "review_helpful_votes_insert_owner_verified"
on public.review_helpful_votes;

create policy "review_helpful_votes_insert_owner_verified"
on public.review_helpful_votes
for insert
to authenticated
with check (auth.uid() = user_id);
