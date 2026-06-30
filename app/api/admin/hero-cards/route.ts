import { revalidatePath } from "next/cache";
import { getYouTubeMetadata } from "../../../_lib/youtube";
import { assertAdmin } from "../_lib/auth";

type AdminHeroCardRequestBody = {
  password?: unknown;
  id?: unknown;
  position?: unknown;
  youtubeUrl?: unknown;
  title?: unknown;
  isPublished?: unknown;
};

type SupabaseAdminHeroCardRow = {
  id: string;
  position: number;
  title: string;
  youtube_url: string;
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function supabaseRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin environment variables are not configured.");
  }

  const response = await fetch(new URL(path, supabaseUrl), {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function parsePosition(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }

  return value >= 1 && value <= 3 ? value : null;
}

export async function GET(request: Request) {
  const adminError = await assertAdmin(request);

  if (adminError) {
    return adminError;
  }

  try {
    const select =
      "id,position,title,youtube_url,thumbnail_url,is_published,created_at";
    const cards = await supabaseRequest<SupabaseAdminHeroCardRow[]>(
      `/rest/v1/hero_video_cards?select=${select}&order=position.asc`
    );

    return Response.json({ cards });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not load hero cards.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let body: AdminHeroCardRequestBody;

  try {
    body = (await request.json()) as AdminHeroCardRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const adminError = await assertAdmin(request, body);

  if (adminError) {
    return adminError;
  }

  const position = parsePosition(body.position);

  if (!position) {
    return Response.json(
      { error: "Position must be 1, 2, or 3." },
      { status: 400 }
    );
  }

  if (typeof body.youtubeUrl !== "string" || !body.youtubeUrl.trim()) {
    return Response.json({ error: "YouTube URL is required." }, { status: 400 });
  }

  const metadata = await getYouTubeMetadata(body.youtubeUrl.trim());

  if (!metadata) {
    return Response.json(
      { error: "Could not read YouTube metadata." },
      { status: 422 }
    );
  }

  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim()
      : metadata.title;

  try {
    const rows = await supabaseRequest<SupabaseAdminHeroCardRow[]>(
      "/rest/v1/hero_video_cards?on_conflict=position",
      {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify({
          position,
          title,
          youtube_video_id: metadata.videoId,
          youtube_url: body.youtubeUrl.trim(),
          thumbnail_url: metadata.thumbnailUrl,
          is_published: body.isPublished !== false,
          updated_at: new Date().toISOString(),
        }),
      }
    );

    revalidatePath("/");

    return Response.json({ card: rows[0] });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not save hero card.",
      },
      { status: 500 }
    );
  }
}
