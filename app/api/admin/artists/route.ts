import { revalidatePath } from "next/cache";
import type { ArtistTab } from "../../../_components/artist/Artist";

type ArtistRequestBody = {
  password?: unknown;
  id?: unknown;
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
  role: ArtistTab;
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

const artistTabs: ArtistTab[] = ["CREATOR", "SINGER", "ACTOR"];
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminPassword = process.env.ADMIN_PASSWORD;

function isArtistTab(value: unknown): value is ArtistTab {
  return typeof value === "string" && artistTabs.includes(value as ArtistTab);
}

function getAdminPassword(request: Request, body?: ArtistRequestBody) {
  return request.headers.get("x-admin-password") ?? body?.password;
}

function assertAdmin(request: Request, body?: ArtistRequestBody) {
  if (!adminPassword) {
    return Response.json(
      { error: "ADMIN_PASSWORD is not configured." },
      { status: 500 }
    );
  }

  if (getAdminPassword(request, body) !== adminPassword) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { error: "Supabase admin environment variables are not configured." },
      { status: 500 }
    );
  }

  return null;
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

  const heightCm = parseInteger(body.heightCm, "Height");
  const sortOrder = parseInteger(body.sortOrder, "Sort order");

  if (heightCm !== null && (heightCm < 1 || heightCm > 300)) {
    throw new Error("Height must be between 1 and 300cm.");
  }

  return {
    role: body.role,
    name: body.name.trim(),
    profile_image_url: parseOptionalUrl(body.profileImageUrl),
    birth_date: parseDate(body.birthDate),
    height_cm: heightCm,
    education:
      typeof body.education === "string" && body.education.trim()
        ? body.education.trim()
        : null,
    youtube_url: parseOptionalUrl(body.youtubeUrl),
    careers: parseCareers(body.careers),
    is_featured: body.isFeatured === true,
    is_published: body.isPublished !== false,
    sort_order: sortOrder ?? 0,
    updated_at: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  const adminError = assertAdmin(request);

  if (adminError) {
    return adminError;
  }

  try {
    const artists = await supabaseRequest<ArtistRow[]>(
      "/rest/v1/artist_profiles?select=id,role,name,profile_image_url,birth_date,height_cm,education,youtube_url,careers,is_featured,is_published,sort_order,created_at&order=role.asc,sort_order.asc,created_at.desc"
    );

    return Response.json({ artists });
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

  const adminError = assertAdmin(request, body);

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

  const adminError = assertAdmin(request, body);

  if (adminError) {
    return adminError;
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
