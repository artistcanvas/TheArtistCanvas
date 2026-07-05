create extension if not exists "pgcrypto";

create table if not exists public.hero_video_cards (
  id uuid primary key default gen_random_uuid(),
  position integer not null,
  title text not null,
  youtube_video_id text,
  youtube_url text not null,
  thumbnail_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hero_video_cards_position_range check (position between 1 and 10),
  constraint hero_video_cards_title_not_empty check (char_length(trim(title)) > 0),
  constraint hero_video_cards_youtube_url_check check (
    youtube_url ~* '^https?://(www\.)?(youtube\.com|youtu\.be)/'
  )
);

alter table public.hero_video_cards
  add column if not exists youtube_video_id text,
  add column if not exists thumbnail_url text,
  add column if not exists is_published boolean not null default true,
  add column if not exists sort_order integer not null default 0;

alter table public.hero_video_cards
  drop constraint if exists hero_video_cards_position_range,
  add constraint hero_video_cards_position_range check (position between 1 and 10);

create unique index if not exists hero_video_cards_position_idx
  on public.hero_video_cards (position);

create unique index if not exists hero_video_cards_youtube_video_id_idx
  on public.hero_video_cards (youtube_video_id)
  where youtube_video_id is not null;

create index if not exists hero_video_cards_published_position_idx
  on public.hero_video_cards (is_published, position)
  where is_published = true;

alter table public.hero_video_cards enable row level security;

drop policy if exists "Public can read published hero video cards" on public.hero_video_cards;
create policy "Public can read published hero video cards"
  on public.hero_video_cards
  for select
  using (is_published = true);
