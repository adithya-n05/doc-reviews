alter table public.module_review_insights
add column if not exists review_count integer not null default 0;
