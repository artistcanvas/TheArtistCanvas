import { revalidatePath } from "next/cache";
import { getYouTubeMetadata } from "../../../_lib/youtube";
import type { WorkTab } from "../../../_components/works/workTypes";

type AdminWorkRequestBody = {
  password?: unknown;
  id?: unknown;
  tab?: unknown;
  youtubeUrl?: unknown;
  typeLabel?: unknown;
  categoryLabel?: unknown;
  description?: unknown;
  isPublished?: unknown;
};

type SupabaseTypeRow = {
  id: string;
  label: string;
};

type SupabaseCategoryRow = {
  id: string;
  label: string;
};

type SupabaseAdminWorkRow = {
  id: string;
  tab: WorkTab;
  title: string;
  youtube_url: string;
  thumbnail_url: string | null;
  description: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  category: {
    id: string;
    label: string;
    profile_image_url: string | null;
    youtube_channel_id: string | null;
  } | null;
  type: {
    id: string;
    label: string;
  } | null;
};

const workTabs: WorkTab[] = ["Original", "Brand & ppl", "Project"];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminPassword = process.env.ADMIN_PASSWORD;

function isWorkTab(value: unknown): value is WorkTab {
  return typeof value === "string" && workTabs.includes(value as WorkTab);
}

function getAdminPassword(request: Request, body?: AdminWorkRequestBody) {
  return request.headers.get("x-admin-password") ?? body?.password;
}

function assertAdmin(request: Request, body?: AdminWorkRequestBody) {
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

async function getOptions() {
  const select =
    "id,tab,title,youtube_url,thumbnail_url,description,is_published,sort_order,created_at,category:work_categories(id,label,profile_image_url,youtube_channel_id),type:work_types(id,label)";
  const [types, categories, works] = await Promise.all([
    supabaseRequest<SupabaseTypeRow[]>(
      "/rest/v1/work_types?select=id,label&order=label.asc"
    ),
    supabaseRequest<Array<SupabaseCategoryRow & { tab: WorkTab }>>(
      "/rest/v1/work_categories?select=id,tab,label&order=tab.asc,sort_order.asc,label.asc"
    ),
    supabaseRequest<SupabaseAdminWorkRow[]>(
      `/rest/v1/works?select=${select}&order=created_at.desc`
    ),
  ]);

  return { types, categories, works };
}

async function upsertType(label: string) {
  const rows = await supabaseRequest<SupabaseTypeRow[]>(
    "/rest/v1/work_types?on_conflict=label",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({ label }),
    }
  );

  return rows[0];
}

async function upsertCategory({
  tab,
  label,
  youtubeChannelId,
  profileImageUrl,
}: {
  tab: WorkTab;
  label: string;
  youtubeChannelId: string | null;
  profileImageUrl: string | null;
}) {
  const rows = await supabaseRequest<SupabaseCategoryRow[]>(
    "/rest/v1/work_categories?on_conflict=tab,label",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        tab,
        label,
        youtube_channel_id: youtubeChannelId,
        profile_image_url: profileImageUrl,
      }),
    }
  );

  return rows[0];
}

export async function GET(request: Request) {
  const adminError = assertAdmin(request);

  if (adminError) {
    return adminError;
  }

  try {
    return Response.json(await getOptions());
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not load options.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let body: AdminWorkRequestBody;

  try {
    body = (await request.json()) as AdminWorkRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const adminError = assertAdmin(request, body);

  if (adminError) {
    return adminError;
  }

  if (!isWorkTab(body.tab)) {
    return Response.json({ error: "Invalid tab." }, { status: 400 });
  }

  if (typeof body.youtubeUrl !== "string" || !body.youtubeUrl.trim()) {
    return Response.json({ error: "YouTube URL is required." }, { status: 400 });
  }

  if (typeof body.typeLabel !== "string" || !body.typeLabel.trim()) {
    return Response.json({ error: "Type is required." }, { status: 400 });
  }

  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;

  if (description && description.length > 80) {
    return Response.json(
      { error: "Description must be 80 characters or less." },
      { status: 400 }
    );
  }

  const metadata = await getYouTubeMetadata(body.youtubeUrl.trim());

  if (!metadata) {
    return Response.json(
      { error: "Could not read YouTube metadata." },
      { status: 422 }
    );
  }

  const categoryLabel = metadata.channelName;

  try {
    const [type, category] = await Promise.all([
      upsertType(body.typeLabel.trim()),
      upsertCategory({
        tab: body.tab,
        label: categoryLabel,
        youtubeChannelId: metadata.channelId,
        profileImageUrl: metadata.channelProfileImageUrl,
      }),
    ]);

    const rows = await supabaseRequest(
      "/rest/v1/works",
      {
        method: "POST",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          tab: body.tab,
          category_id: category.id,
          type_id: type.id,
          youtube_video_id: metadata.videoId,
          title: metadata.title,
          youtube_url: body.youtubeUrl.trim(),
          thumbnail_url: metadata.thumbnailUrl,
          description,
          is_published: body.isPublished !== false,
        }),
      }
    );

    revalidatePath("/work");

    return Response.json({ work: Array.isArray(rows) ? rows[0] : rows });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Could not save work.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  let body: AdminWorkRequestBody;

  try {
    body = (await request.json()) as AdminWorkRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const adminError = assertAdmin(request, body);

  if (adminError) {
    return adminError;
  }

  if (typeof body.id !== "string" || !body.id.trim()) {
    return Response.json({ error: "Work id is required." }, { status: 400 });
  }

  if (!isWorkTab(body.tab)) {
    return Response.json({ error: "Invalid tab." }, { status: 400 });
  }

  if (typeof body.youtubeUrl !== "string" || !body.youtubeUrl.trim()) {
    return Response.json({ error: "YouTube URL is required." }, { status: 400 });
  }

  if (typeof body.typeLabel !== "string" || !body.typeLabel.trim()) {
    return Response.json({ error: "Type is required." }, { status: 400 });
  }

  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;

  if (description && description.length > 80) {
    return Response.json(
      { error: "Description must be 80 characters or less." },
      { status: 400 }
    );
  }

  const metadata = await getYouTubeMetadata(body.youtubeUrl.trim());

  if (!metadata) {
    return Response.json(
      { error: "Could not read YouTube metadata." },
      { status: 422 }
    );
  }

  const categoryLabel = metadata.channelName;

  try {
    const [type, category] = await Promise.all([
      upsertType(body.typeLabel.trim()),
      upsertCategory({
        tab: body.tab,
        label: categoryLabel,
        youtubeChannelId: metadata.channelId,
        profileImageUrl: metadata.channelProfileImageUrl,
      }),
    ]);

    const rows = await supabaseRequest(
      `/rest/v1/works?id=eq.${body.id}`,
      {
        method: "PATCH",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          tab: body.tab,
          category_id: category.id,
          type_id: type.id,
          youtube_video_id: metadata.videoId,
          title: metadata.title,
          youtube_url: body.youtubeUrl.trim(),
          thumbnail_url: metadata.thumbnailUrl,
          description,
          is_published: body.isPublished !== false,
          updated_at: new Date().toISOString(),
        }),
      }
    );

    revalidatePath("/work");

    return Response.json({ work: Array.isArray(rows) ? rows[0] : rows });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not update work.",
      },
      { status: 500 }
    );
  }
}
