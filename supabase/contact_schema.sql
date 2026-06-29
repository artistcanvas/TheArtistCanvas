create extension if not exists "pgcrypto";

do $$ begin
  create type public.contact_inquiry_type as enum (
    'content_production',
    'advertising_ppl',
    'casting',
    'general'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.contact_emails (
  id uuid primary key default gen_random_uuid(),
  inquiry_type public.contact_inquiry_type not null,
  email text not null,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_emails_email_not_empty check (char_length(trim(email)) > 0),
  constraint contact_emails_email_format check (
    email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  unique (inquiry_type, email)
);

alter table public.contact_emails
  add column if not exists is_published boolean not null default true,
  add column if not exists sort_order integer not null default 0;

create index if not exists contact_emails_type_sort_idx
  on public.contact_emails (inquiry_type, sort_order, created_at);

create index if not exists contact_emails_published_idx
  on public.contact_emails (is_published)
  where is_published = true;

alter table public.contact_emails enable row level security;

drop policy if exists "Public can read published contact emails" on public.contact_emails;
create policy "Public can read published contact emails"
  on public.contact_emails
  for select
  using (is_published = true);
