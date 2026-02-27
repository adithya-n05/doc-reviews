-- Review writes are already guarded by verified-session checks in app/server code.
-- Keep RLS ownership enforcement without querying auth.users directly.

drop policy if exists "reviews_insert_owner_verified"
on public.reviews;

create policy "reviews_insert_owner_verified"
on public.reviews
for insert
to authenticated
with check (auth.uid() = user_id);
