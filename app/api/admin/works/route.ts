import { revalidatePath } from "next/cache";
import { getYouTubeMetadata } from "../../../_lib/youtube";
import type { WorkTab } from "../../../_components/works/workTypes";
import { projectWorkCategoryLabels } from "../../../_components/works/workTypes";
import { assertAdmin } from "../_lib/auth";

type AdminWorkRequestBody = {
  password?: unknown;
  action?: unknown;
  id?: unknown;
  categoryId?: unknown;
  ids?: unknown;
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
  tab: WorkTab;
  label: string;
  profile_image_url: string | null;
  youtube_channel_id: string | null;
  sort_order: number;
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

type SupabaseWorkDeleteTargetRow = {
  id: string;
  category_id: string;
  category: {
    id: string;
    tab: WorkTab;
  } | null;
};

const workTabs: WorkTab[] = ["Original", "Brand & ppl", "Project"];
const projectWorkCategorySet = new Set<string>(projectWorkCategoryLabels);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isWorkTab(value: unknown): value is WorkTab {
  return typeof value === "string" && workTabs.includes(value as WorkTab);
}

function getProjectCategoryLabel(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const label = value.trim();

  return projectWorkCategorySet.has(label) ? label : null;
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

async function getOptions() {
  const select =
    "id,tab,title,youtube_url,thumbnail_url,description,is_published,sort_order,created_at,category:work_categories(id,label,profile_image_url,youtube_channel_id),type:work_types(id,label)";
  const [types, categories, works] = await Promise.all([
    supabaseRequest<SupabaseTypeRow[]>(
      "/rest/v1/work_types?select=id,label&order=label.asc"
    ),
    supabaseRequest<SupabaseCategoryRow[]>(
      "/rest/v1/work_categories?select=id,tab,label,profile_image_url,youtube_channel_id,sort_order&order=tab.asc,sort_order.asc,label.asc"
    ),
    supabaseRequest<SupabaseAdminWorkRow[]>(
      `/rest/v1/works?select=${select}&order=tab.asc,sort_order.asc,created_at.desc`
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
  const adminError = await assertAdmin(request);

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

  const adminError = await assertAdmin(request, body);

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

  const projectCategoryLabel =
    body.tab === "Project" ? getProjectCategoryLabel(body.categoryLabel) : null;

  if (body.tab === "Project" && !projectCategoryLabel) {
    return Response.json(
      { error: "Project sub tab is required." },
      { status: 400 }
    );
  }

  const categoryLabel = projectCategoryLabel ?? metadata.channelName;

  try {
    const [type, category] = await Promise.all([
      upsertType(body.typeLabel.trim()),
      upsertCategory({
        tab: body.tab,
        label: categoryLabel,
        youtubeChannelId: body.tab === "Project" ? null : metadata.channelId,
        profileImageUrl:
          body.tab === "Project" ? null : metadata.channelProfileImageUrl,
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

  const adminError = await assertAdmin(request, body);

  if (adminError) {
    return adminError;
  }

  if (body.action === "reorder") {
    if (!isStringArray(body.ids)) {
      return Response.json({ error: "Work ids are required." }, { status: 400 });
    }

    try {
      await Promise.all(
        body.ids.map((id, index) =>
          supabaseRequest(
            `/rest/v1/works?id=eq.${id}`,
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

      revalidatePath("/work");

      return Response.json({ ok: true });
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error ? error.message : "Could not reorder works.",
        },
        { status: 500 }
      );
    }
  }

  if (body.action === "reorderCategories") {
    if (!isStringArray(body.ids)) {
      return Response.json(
        { error: "Category ids are required." },
        { status: 400 }
      );
    }

    try {
      await Promise.all(
        body.ids.map((id, index) =>
          supabaseRequest(
            `/rest/v1/work_categories?id=eq.${id}`,
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

      revalidatePath("/work");

      return Response.json({ ok: true });
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Could not reorder categories.",
        },
        { status: 500 }
      );
    }
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

  const projectCategoryLabel =
    body.tab === "Project" ? getProjectCategoryLabel(body.categoryLabel) : null;

  if (body.tab === "Project" && !projectCategoryLabel) {
    return Response.json(
      { error: "Project sub tab is required." },
      { status: 400 }
    );
  }

  const categoryLabel = projectCategoryLabel ?? metadata.channelName;

  try {
    const [type, category] = await Promise.all([
      upsertType(body.typeLabel.trim()),
      upsertCategory({
        tab: body.tab,
        label: categoryLabel,
        youtubeChannelId: body.tab === "Project" ? null : metadata.channelId,
        profileImageUrl:
          body.tab === "Project" ? null : metadata.channelProfileImageUrl,
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

export async function DELETE(request: Request) {
  let body: AdminWorkRequestBody;

  try {
    body = (await request.json()) as AdminWorkRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const adminError = await assertAdmin(request, body);

  if (adminError) {
    return adminError;
  }

  if (body.action === "deleteCategory") {
    if (typeof body.categoryId !== "string" || !body.categoryId.trim()) {
      return Response.json(
        { error: "Category id is required." },
        { status: 400 }
      );
    }

    try {
      const [category] = await supabaseRequest<SupabaseCategoryRow[]>(
        `/rest/v1/work_categories?id=eq.${body.categoryId}&select=id,tab,label,profile_image_url,youtube_channel_id,sort_order`
      );

      if (!category) {
        return Response.json(
          { error: "Category was not found." },
          { status: 404 }
        );
      }

      if (category.tab === "Project") {
        return Response.json(
          { error: "Project sub tabs cannot be deleted here." },
          { status: 400 }
        );
      }

      const deletedWorks = await supabaseRequest<SupabaseAdminWorkRow[]>(
        `/rest/v1/works?category_id=eq.${body.categoryId}`,
        {
          method: "DELETE",
          headers: {
            Prefer: "return=representation",
          },
        }
      );

      const deletedCategories = await supabaseRequest<SupabaseCategoryRow[]>(
        `/rest/v1/work_categories?id=eq.${body.categoryId}`,
        {
          method: "DELETE",
          headers: {
            Prefer: "return=representation",
          },
        }
      );

      revalidatePath("/work");

      return Response.json({
        category: deletedCategories[0] ?? category,
        deletedWorkCount: deletedWorks.length,
      });
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Could not delete category.",
        },
        { status: 500 }
      );
    }
  }

  if (typeof body.id !== "string" || !body.id.trim()) {
    return Response.json({ error: "Work id is required." }, { status: 400 });
  }

  try {
    const [targetWork] = await supabaseRequest<SupabaseWorkDeleteTargetRow[]>(
      `/rest/v1/works?id=eq.${body.id}&select=id,category_id,category:work_categories(id,tab)`
    );

    const rows = await supabaseRequest<SupabaseAdminWorkRow[]>(
      `/rest/v1/works?id=eq.${body.id}`,
      {
        method: "DELETE",
        headers: {
          Prefer: "return=representation",
        },
      }
    );

    let deletedCategory: SupabaseCategoryRow | null = null;

    if (targetWork?.category_id && targetWork.category?.tab !== "Project") {
      const remainingWorks = await supabaseRequest<Array<{ id: string }>>(
        `/rest/v1/works?category_id=eq.${targetWork.category_id}&select=id&limit=1`
      );

      if (remainingWorks.length === 0) {
        const deletedCategories = await supabaseRequest<SupabaseCategoryRow[]>(
          `/rest/v1/work_categories?id=eq.${targetWork.category_id}`,
          {
            method: "DELETE",
            headers: {
              Prefer: "return=representation",
            },
          }
        );

        deletedCategory = deletedCategories[0] ?? null;
      }
    }

    revalidatePath("/work");

    return Response.json({ work: rows[0] ?? null, deletedCategory });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not delete work.",
      },
      { status: 500 }
    );
  }
}
