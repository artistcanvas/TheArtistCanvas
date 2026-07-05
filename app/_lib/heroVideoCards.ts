import { fallbackHeroVideoCards } from "../_components/hero/heroVideoFallbackData";
import type { HeroVideoCard } from "../_components/hero/heroVideoCardTypes";
import { getYouTubeThumbnailUrl, getYouTubeVideoId } from "./youtube";

type SupabaseHeroVideoCardRow = {
  id: string;
  position: number;
  title: string;
  youtube_url: string;
  thumbnail_url: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getFallbackThumbnail(url: string) {
  const videoId = getYouTubeVideoId(url);

  return videoId ? getYouTubeThumbnailUrl(videoId) : null;
}

function mapHeroVideoCard(row: SupabaseHeroVideoCardRow): HeroVideoCard {
  return {
    id: row.id,
    position: row.position,
    title: row.title,
    youtubeUrl: row.youtube_url,
    thumbnailUrl: row.thumbnail_url ?? getFallbackThumbnail(row.youtube_url),
  };
}

export async function getHeroVideoCards(): Promise<HeroVideoCard[]> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return fallbackHeroVideoCards;
  }

  const url = new URL("/rest/v1/hero_video_cards", supabaseUrl);
  url.searchParams.set(
    "select",
    "id,position,title,youtube_url,thumbnail_url"
  );
  url.searchParams.set("is_published", "eq.true");
  url.searchParams.set("order", "position.asc");

  const response = await fetch(url, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    next: { revalidate: 60 },
  }).catch(() => null);

  if (!response?.ok) {
    return fallbackHeroVideoCards;
  }

  const rows = (await response.json()) as SupabaseHeroVideoCardRow[];
  const cards = rows.map(mapHeroVideoCard).slice(0, 10);

  return cards.length > 0 ? cards : fallbackHeroVideoCards;
}
