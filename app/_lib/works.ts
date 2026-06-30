import { fallbackWorksData } from "../_components/works/workFallbackData";
import type { PplPartner, Work, WorkCategory, WorksData, WorkTab } from "../_components/works/workTypes";
import { workDataTabs } from "../_components/works/workTypes";
import { getYouTubeThumbnailUrl, getYouTubeVideoId } from "./youtube";

type SupabaseWorkRow = {
  id: string;
  tab: WorkTab;
  title: string;
  youtube_url: string;
  description: string | null;
  thumbnail_url: string | null;
  category: {
    id: string;
    label: string;
    color: string | null;
    profile_image_url: string | null;
  } | null;
  type: {
    label: string;
  } | null;
};

type SupabasePplPartnerRow = {
  id: string;
  name: string;
  website_url: string;
  logo_url: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getFallbackThumbnail(url: string) {
  const videoId = getYouTubeVideoId(url);

  return videoId ? getYouTubeThumbnailUrl(videoId) : null;
}

function emptyWorksData(): WorksData {
  return {
    Original: { categories: [], works: [] },
    "Brand & ppl": { categories: [], works: [] },
    Project: { categories: [], works: [] },
    pplPartners: [],
  };
}

function mapRowsToWorksData(rows: SupabaseWorkRow[]): WorksData {
  const worksData = emptyWorksData();
  const categoryIdsByTab = new Map<WorkTab, Set<string>>(
    workDataTabs.map((tab) => [tab, new Set<string>()])
  );

  rows.forEach((row) => {
    const category = row.category;

    if (!category) {
      return;
    }

    const categoryIds = categoryIdsByTab.get(row.tab);

    if (!categoryIds?.has(category.id)) {
      const mappedCategory: WorkCategory = {
        id: category.id,
        label: category.label,
        color: category.color,
        profileImageUrl: category.profile_image_url,
      };

      worksData[row.tab].categories.push(mappedCategory);
      categoryIds?.add(category.id);
    }

    const work: Work = {
      id: row.id,
      title: row.title,
      type: row.type?.label ?? "WORK",
      description: row.description,
      categoryId: category.id,
      youtubeUrl: row.youtube_url,
      thumbnailUrl: row.thumbnail_url ?? getFallbackThumbnail(row.youtube_url),
    };

    worksData[row.tab].works.push(work);
  });

  return worksData;
}

export async function getWorksData(): Promise<WorksData> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return fallbackWorksData;
  }

  const workSelect =
    "id,tab,title,youtube_url,description,thumbnail_url,category:work_categories(id,label,color,profile_image_url),type:work_types(label)";
  const workUrl = new URL("/rest/v1/works", supabaseUrl);
  workUrl.searchParams.set("select", workSelect);
  workUrl.searchParams.set("is_published", "eq.true");
  workUrl.searchParams.set("order", "tab.asc,sort_order.asc,created_at.desc");

  const pplUrl = new URL("/rest/v1/ppl_partners", supabaseUrl);
  pplUrl.searchParams.set("select", "id,name,website_url,logo_url");
  pplUrl.searchParams.set("is_published", "eq.true");
  pplUrl.searchParams.set("order", "sort_order.asc,created_at.desc");

  const headers = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  };

  const [workResponse, pplResponse] = await Promise.all([
    fetch(workUrl, { headers, next: { revalidate: 60 } }).catch(() => null),
    fetch(pplUrl, { headers, next: { revalidate: 60 } }).catch(() => null),
  ]);

  if (!workResponse?.ok) {
    return fallbackWorksData;
  }

  const rows = (await workResponse.json()) as SupabaseWorkRow[];
  const worksData = mapRowsToWorksData(rows);

  if (pplResponse?.ok) {
    const pplRows = (await pplResponse.json()) as SupabasePplPartnerRow[];
    const pplPartners: PplPartner[] = pplRows.map((partner) => ({
      id: partner.id,
      name: partner.name,
      websiteUrl: partner.website_url,
      logoUrl: partner.logo_url,
    }));

    worksData.pplPartners = pplPartners;
  }

  return workDataTabs.some((tab) => worksData[tab].works.length > 0)
    ? worksData
    : fallbackWorksData;
}
