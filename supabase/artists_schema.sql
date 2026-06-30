create extension if not exists "pgcrypto";

insert into storage.buckets (id, name, public)
values ('artist-images', 'artist-images', true)
on conflict (id) do update set public = excluded.public;

do $$ begin
  create type public.artist_role as enum ('WITH', 'MCN');
exception
  when duplicate_object then null;
end $$;

alter type public.artist_role add value if not exists 'WITH';
alter type public.artist_role add value if not exists 'MCN';

create table if not exists public.artist_profiles (
  id uuid primary key default gen_random_uuid(),
  role public.artist_role not null,
  name text not null,
  profile_image_url text,
  birth_date date,
  height_cm integer,
  education text,
  youtube_url text,
  careers text[] not null default '{}',
  is_featured boolean not null default false,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint artist_profiles_name_not_empty check (char_length(trim(name)) > 0),
  constraint artist_profiles_height_cm_check check (
    height_cm is null or height_cm between 1 and 300
  ),
  constraint artist_profiles_profile_image_url_check check (
    profile_image_url is null or profile_image_url ~* '^https?://'
  ),
  constraint artist_profiles_youtube_url_check check (
    youtube_url is null
    or youtube_url ~* '^https?://(www\.)?(youtube\.com|youtu\.be)/'
  )
);

alter table public.artist_profiles
  add column if not exists profile_image_url text,
  add column if not exists birth_date date,
  add column if not exists height_cm integer,
  add column if not exists education text,
  add column if not exists youtube_url text,
  add column if not exists careers text[] not null default '{}',
  add column if not exists is_featured boolean not null default false,
  add column if not exists is_published boolean not null default true,
  add column if not exists sort_order integer not null default 0;

create index if not exists artist_profiles_role_sort_idx
  on public.artist_profiles (role, sort_order, created_at desc);

create index if not exists artist_profiles_published_idx
  on public.artist_profiles (is_published)
  where is_published = true;

alter table public.artist_profiles enable row level security;

drop policy if exists "Public can read published artist profiles" on public.artist_profiles;
create policy "Public can read published artist profiles"
  on public.artist_profiles
  for select
  using (is_published = true);

drop policy if exists "Public can read artist images" on storage.objects;
create policy "Public can read artist images"
  on storage.objects
  for select
  using (bucket_id = 'artist-images');
