-- Project works now use fixed sub tabs instead of YouTube channel categories.

insert into public.work_categories (
  tab,
  label,
  color,
  sort_order,
  youtube_channel_id,
  profile_image_url
)
values
  ('Project', '뮤직 비디오', '#FF9D71', 0, null, null),
  ('Project', '광고 영상', '#8D4CFF', 1, null, null),
  ('Project', '기업 영상', '#3DA5FF', 2, null, null),
  ('Project', '라이브 콘텐츠', '#45D483', 3, null, null)
on conflict (tab, label) do update
set
  color = excluded.color,
  sort_order = excluded.sort_order,
  youtube_channel_id = null,
  profile_image_url = null,
  updated_at = now();

with default_project_category as (
  select id
  from public.work_categories
  where tab = 'Project' and label = '뮤직 비디오'
  limit 1
)
update public.works
set
  category_id = default_project_category.id,
  updated_at = now()
from default_project_category
where
  works.tab = 'Project'
  and works.category_id in (
    select id
    from public.work_categories
    where
      tab = 'Project'
      and label not in ('뮤직 비디오', '광고 영상', '기업 영상', '라이브 콘텐츠')
  );

delete from public.work_categories category
where
  category.tab = 'Project'
  and category.label not in ('뮤직 비디오', '광고 영상', '기업 영상', '라이브 콘텐츠')
  and not exists (
    select 1
    from public.works work
    where work.category_id = category.id
  );
