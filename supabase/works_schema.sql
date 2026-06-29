create extension if not exists "pgcrypto";

insert into storage.buckets (id, name, public)
values ('ppl-logos', 'ppl-logos', true)
on conflict (id) do update set public = excluded.public;

do $$ begin
  create type public.work_tab as enum ('Original', 'Brand & ppl', 'Project');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.work_categories (
  id uuid primary key default gen_random_uuid(),
  tab public.work_tab not null,
  label text not null,
  youtube_channel_id text,
  profile_image_url text,
  color text default '#8D4CFF',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tab, label)
);

create table if not exists public.work_types (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  tab public.work_tab not null,
  category_id uuid not null references public.work_categories(id) on delete restrict,
  type_id uuid not null references public.work_types(id) on delete restrict,
  youtube_video_id text,
  title text not null,
  youtube_url text not null,
  thumbnail_url text,
  description varchar(80),
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint works_description_short check (
    description is null or char_length(description) <= 80
  ),
  constraint works_youtube_url_check check (
    youtube_url ~* '^https?://(www\.)?(youtube\.com|youtu\.be)/'
  )
);

create table if not exists public.ppl_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website_url text not null unique,
  logo_url text,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ppl_partners_website_url_check check (
    website_url ~* '^https?://'
  )
);

drop view if exists public.original_works;
drop view if exists public.brand_ppl_works;
drop view if exists public.project_works;

alter table public.work_categories
  add column if not exists youtube_channel_id text,
  add column if not exists profile_image_url text,
  add column if not exists color text default '#8D4CFF';

alter table public.works
  add column if not exists youtube_video_id text,
  add column if not exists thumbnail_url text,
  add column if not exists description varchar(80),
  add column if not exists is_published boolean not null default true,
  add column if not exists sort_order integer not null default 0;

alter table public.works
  drop column if exists is_featured;

alter table public.ppl_partners
  add column if not exists logo_url text,
  add column if not exists is_published boolean not null default true,
  add column if not exists sort_order integer not null default 0;

create index if not exists work_categories_tab_sort_idx
  on public.work_categories (tab, sort_order, created_at);

create unique index if not exists work_categories_tab_youtube_channel_id_idx
  on public.work_categories (tab, youtube_channel_id)
  where youtube_channel_id is not null;

create index if not exists works_tab_category_sort_idx
  on public.works (tab, category_id, sort_order, created_at desc);

create unique index if not exists works_youtube_video_id_idx
  on public.works (youtube_video_id)
  where youtube_video_id is not null;

create index if not exists ppl_partners_sort_idx
  on public.ppl_partners (sort_order, created_at desc);

create or replace view public.original_works as
select * from public.works where tab = 'Original';

create or replace view public.brand_ppl_works as
select * from public.works where tab = 'Brand & ppl';

create or replace view public.project_works as
select * from public.works where tab = 'Project';

alter table public.work_categories enable row level security;
alter table public.work_types enable row level security;
alter table public.works enable row level security;
alter table public.ppl_partners enable row level security;

drop policy if exists "Public can read work categories" on public.work_categories;
create policy "Public can read work categories"
  on public.work_categories
  for select
  using (true);

drop policy if exists "Public can read work types" on public.work_types;
create policy "Public can read work types"
  on public.work_types
  for select
  using (true);

drop policy if exists "Public can read published works" on public.works;
create policy "Public can read published works"
  on public.works
  for select
  using (is_published = true);

drop policy if exists "Public can read published ppl partners" on public.ppl_partners;
create policy "Public can read published ppl partners"
  on public.ppl_partners
  for select
  using (is_published = true);

drop policy if exists "Public can read ppl logos" on storage.objects;
create policy "Public can read ppl logos"
  on storage.objects
  for select
  using (bucket_id = 'ppl-logos');
