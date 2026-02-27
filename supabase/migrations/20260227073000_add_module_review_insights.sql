create table if not exists public.module_review_insights (
  module_id uuid primary key references public.modules(id) on delete cascade,
  reviews_fingerprint text not null,
  summary text not null,
  top_keywords jsonb not null default '[]'::jsonb,
  sentiment jsonb not null default '{"positive":0,"neutral":0,"negative":0}'::jsonb,
  source text not null check (source in ('ai', 'fallback')),
  generated_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists module_review_insights_generated_at_idx
on public.module_review_insights (generated_at desc);

alter table public.module_review_insights enable row level security;

create policy "module_review_insights_select_authenticated"
on public.module_review_insights
for select
to authenticated
using (true);
