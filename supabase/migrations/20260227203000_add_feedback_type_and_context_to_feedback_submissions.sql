alter table public.feedback_submissions
add column if not exists feedback_type text not null default 'general'
check (feedback_type in ('general', 'bug', 'feature', 'ui', 'data', 'other'));

alter table public.feedback_submissions
add column if not exists context jsonb not null default '{}'::jsonb;
