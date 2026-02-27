alter table public.module_leaders
  add column if not exists profile_url text,
  add column if not exists photo_url text;
