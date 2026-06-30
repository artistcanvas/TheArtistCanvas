import { revalidatePath } from "next/cache";
import type {
  ArtistRole,
  ArtistTab,
} from "../../../_components/artist/Artist";
import { assertAdmin } from "../_lib/auth";

type ArtistRequestBody = {
  password?: unknown;
  action?: unknown;
  id?: unknown;
  ids?: unknown;
  role?: unknown;
  name?: unknown;
  profileImageUrl?: unknown;
  birthDate?: unknown;
  heightCm?: unknown;
  education?: unknown;
  youtubeUrl?: unknown;
  careers?: unknown;
  isFeatured?: unknown;
  isPublished?: unknown;
  sortOrder?: unknown;
};

type ArtistRow = {
  id: string;
  role: ArtistRole;
  name: string;
  profile_image_url: string | null;
  birth_date: string | null;
  height_cm: number | null;
  education: string | null;
  youtube_url: string | null;
  careers: string[];
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
};

const artistTabs: ArtistTab[] = ["WITH", "MCN"];
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isArtistTab(value: unknown): value is ArtistTab {
  return typeof value === "string" && artistTabs.includes(value as ArtistTab);
}

function normalizeArtistRole(role: ArtistRole): ArtistTab {
  return role === "MCN" ? "MCN" : "WITH";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

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

async function readBody(request: Request) {
  try {
    return (await request.json()) as ArtistRequestBody;
  } catch {
    return null;
  }
}

function parseOptionalUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    throw new Error("URL must be valid.");
  }
}

function parseDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    throw new Error("Birth date must be YYYY-MM-DD.");
  }

  return value.trim();
}

function parseInteger(value: unknown, fieldName: string) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isInteger(number)) {
    throw new Error(`${fieldName} must be an integer.`);
  }

  return number;
}

function parseCareers(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((career): career is string => typeof career === "string")
      .map((career) => career.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((career) => career.trim())
      .filter(Boolean);
  }

  return [];
}

function buildPayload(body: ArtistRequestBody) {
  if (!isArtistTab(body.role)) {
    throw new Error("Invalid artist role.");
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    throw new Error("Artist name is required.");
  }

  const isWithArtist = body.role === "WITH";
  const heightCm = isWithArtist ? null : parseInteger(body.heightCm, "Height");
  const sortOrder = parseInteger(body.sortOrder, "Sort order");

  if (heightCm !== null && (heightCm < 1 || heightCm > 300)) {
    throw new Error("Height must be between 1 and 300cm.");
  }

  return {
    role: body.role,
    name: body.name.trim(),
    profile_image_url: parseOptionalUrl(body.profileImageUrl),
    birth_date: isWithArtist ? null : parseDate(body.birthDate),
    height_cm: heightCm,
    education:
      !isWithArtist && typeof body.education === "string" && body.education.trim()
        ? body.education.trim()
        : null,
    youtube_url: parseOptionalUrl(body.youtubeUrl),
    careers: isWithArtist ? [] : parseCareers(body.careers),
    is_featured: false,
    is_published: body.isPublished !== false,
    sort_order: sortOrder ?? 0,
    updated_at: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  const adminError = await assertAdmin(request);

  if (adminError) {
    return adminError;
  }

  try {
    const artists = await supabaseRequest<ArtistRow[]>(
      "/rest/v1/artist_profiles?select=id,role,name,profile_image_url,birth_date,height_cm,education,youtube_url,careers,is_featured,is_published,sort_order,created_at&order=role.asc,sort_order.asc,created_at.desc"
    );

    return Response.json({
      artists: artists.map((artist) => ({
        ...artist,
        role: normalizeArtistRole(artist.role),
      })),
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not load artists.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await readBody(request);

  if (!body) {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const adminError = await assertAdmin(request, body);

  if (adminError) {
    return adminError;
  }

  try {
    const rows = await supabaseRequest<ArtistRow[]>("/rest/v1/artist_profiles", {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify(buildPayload(body)),
    });

    revalidatePath("/artist");

    return Response.json({ artist: rows[0] });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Could not save artist.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const body = await readBody(request);

  if (!body) {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const adminError = await assertAdmin(request, body);

  if (adminError) {
    return adminError;
  }

  if (body.action === "reorder") {
    if (!isStringArray(body.ids)) {
      return Response.json({ error: "Artist ids are required." }, { status: 400 });
    }

    try {
      await Promise.all(
        body.ids.map((id, index) =>
          supabaseRequest(
            `/rest/v1/artist_profiles?id=eq.${id}`,
            {
              method: "PATCH",
              headers: {
                Prefer: "return=representation",
              },
              body: JSON.stringify({
                sort_order: index,
                updated_at: new Date().toISOString(),
              }),
            }
          )
        )
      );

      revalidatePath("/artist");

      return Response.json({ ok: true });
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error ? error.message : "Could not reorder artists.",
        },
        { status: 500 }
      );
    }
  }

  if (typeof body.id !== "string" || !body.id.trim()) {
    return Response.json({ error: "Artist id is required." }, { status: 400 });
  }

  try {
    const rows = await supabaseRequest<ArtistRow[]>(
      `/rest/v1/artist_profiles?id=eq.${body.id}`,
      {
        method: "PATCH",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify(buildPayload(body)),
      }
    );

    revalidatePath("/artist");

    return Response.json({ artist: rows[0] });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not update artist.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const body = await readBody(request);

  if (!body) {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const adminError = await assertAdmin(request, body);

  if (adminError) {
    return adminError;
  }

  if (typeof body.id !== "string" || !body.id.trim()) {
    return Response.json({ error: "Artist id is required." }, { status: 400 });
  }

  try {
    const rows = await supabaseRequest(
      `/rest/v1/artist_profiles?id=eq.${body.id}`,
      {
        method: "DELETE",
        headers: {
          Prefer: "return=representation",
        },
      }
    );

    revalidatePath("/artist");

    return Response.json({ artist: Array.isArray(rows) ? rows[0] : rows });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not delete artist.",
      },
      { status: 500 }
    );
  }
}
