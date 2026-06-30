import { fallbackArtistsData } from "../_components/artist/artistFallbackData";
import type {
  ArtistProfile,
  ArtistRole,
  ArtistTab,
} from "../_components/artist/Artist";

type SupabaseArtistRow = {
  id: string;
  role: ArtistRole;
  name: string;
  profile_image_url: string | null;
  birth_date: string | null;
  height_cm: number | null;
  education: string | null;
  youtube_url: string | null;
  careers: string[] | null;
  is_featured: boolean;
};

const artistTabs: ArtistTab[] = ["WITH", "MCN"];
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function emptyArtistsData(): Record<ArtistTab, ArtistProfile[]> {
  return {
    WITH: [],
    MCN: [],
  };
}

function formatBirthDate(value: string | null) {
  return value ? value.replaceAll("-", ".") : undefined;
}

function mapRowsToArtistsData(rows: SupabaseArtistRow[]) {
  const artistsData = emptyArtistsData();

  rows.forEach((row) => {
    const tab: ArtistTab = row.role === "MCN" ? "MCN" : "WITH";

    artistsData[tab].push({
      id: row.id,
      name: row.name,
      role: row.role,
      profileImageUrl: row.profile_image_url,
      birthDate: formatBirthDate(row.birth_date),
      height: row.height_cm ? `${row.height_cm}cm` : undefined,
      education: row.education ?? undefined,
      youtubeUrl: row.youtube_url ?? undefined,
      careers: row.careers ?? [],
      isFeatured: row.is_featured,
    });
  });

  return artistsData;
}

export async function getArtistsData(): Promise<Record<ArtistTab, ArtistProfile[]>> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return fallbackArtistsData;
  }

  const artistUrl = new URL("/rest/v1/artist_profiles", supabaseUrl);
  artistUrl.searchParams.set(
    "select",
    "id,role,name,profile_image_url,birth_date,height_cm,education,youtube_url,careers,is_featured"
  );
  artistUrl.searchParams.set("is_published", "eq.true");
  artistUrl.searchParams.set("order", "role.asc,sort_order.asc,created_at.desc");

  const response = await fetch(artistUrl, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    next: { revalidate: 60 },
  }).catch(() => null);

  if (!response?.ok) {
    return fallbackArtistsData;
  }

  const rows = (await response.json()) as SupabaseArtistRow[];
  const artistsData = mapRowsToArtistsData(rows);

  return artistTabs.some((tab) => artistsData[tab].length > 0)
    ? artistsData
    : fallbackArtistsData;
}
