-- Apply after supabase/artists_schema.sql and supabase/works_schema.sql.
-- Works admin now uses the existing works tables plus public.ppl_partners for
-- the PPL tab, so no extra Works table is required.
--
-- Artist admin uses:
-- - WITH: profile_image_url, name, youtube_url, is_published, sort_order
-- - MCN: the full artist profile form from public.artist_profiles

create extension if not exists "pgcrypto";

alter type public.artist_role add value if not exists 'WITH';
alter type public.artist_role add value if not exists 'MCN';

insert into storage.buckets (id, name, public)
values ('artist-images', 'artist-images', true)
on conflict (id) do update set public = excluded.public;

update public.artist_profiles
set
  birth_date = null,
  height_cm = null,
  education = null,
  careers = '{}',
  is_featured = false,
  updated_at = now()
where role::text = 'WITH';

alter table public.artist_profiles
  drop constraint if exists artist_profiles_with_minimal_fields_check;

alter table public.artist_profiles
  add constraint artist_profiles_with_minimal_fields_check
  check (
    role::text <> 'WITH'
    or (
      birth_date is null
      and height_cm is null
      and education is null
      and careers = '{}'
      and is_featured = false
    )
  );

drop policy if exists "Public can read artist images" on storage.objects;
create policy "Public can read artist images"
  on storage.objects
  for select
  using (bucket_id = 'artist-images');
