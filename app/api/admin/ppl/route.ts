import { revalidatePath } from "next/cache";
import { getSiteMetadata } from "../../../_lib/siteMetadata";
import { assertAdmin } from "../_lib/auth";

type PplRequestBody = {
  password?: unknown;
  action?: unknown;
  id?: unknown;
  ids?: unknown;
  name?: unknown;
  websiteUrl?: unknown;
  logoUrl?: unknown;
  isPublished?: unknown;
};

type PplPartnerRow = {
  id: string;
  name: string;
  website_url: string;
  logo_url: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}) {
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
    return (await request.json()) as PplRequestBody;
  } catch {
    return null;
  }
}

function parseWebsiteUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

async function buildPayload(body: PplRequestBody) {
  const websiteUrl = parseWebsiteUrl(body.websiteUrl);

  if (!websiteUrl) {
    throw new Error("Valid website URL is required.");
  }

  const metadata = await getSiteMetadata(websiteUrl);
  const name =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim()
      : metadata?.name;
  const logoUrl =
    typeof body.logoUrl === "string" && body.logoUrl.trim()
      ? body.logoUrl.trim()
      : metadata?.logoUrl;

  if (!name) {
    throw new Error("Partner name is required.");
  }

  return {
    name,
    website_url: websiteUrl,
    logo_url: logoUrl ?? null,
    is_published: body.isPublished !== false,
    updated_at: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  const adminError = await assertAdmin(request);

  if (adminError) {
    return adminError;
  }

  try {
    const partners = await supabaseRequest<PplPartnerRow[]>(
      "/rest/v1/ppl_partners?select=id,name,website_url,logo_url,is_published,sort_order,created_at&order=sort_order.asc,created_at.desc"
    );

    return Response.json({ partners });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not load partners.",
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
    const payload = await buildPayload(body);
    const rows = await supabaseRequest<PplPartnerRow[]>(
      "/rest/v1/ppl_partners?on_conflict=website_url",
      {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(payload),
      }
    );

    revalidatePath("/work");

    return Response.json({ partner: rows[0] });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Could not save partner.",
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
      return Response.json(
        { error: "Partner ids are required." },
        { status: 400 }
      );
    }

    try {
      await Promise.all(
        body.ids.map((id, index) =>
          supabaseRequest<PplPartnerRow[]>(
            `/rest/v1/ppl_partners?id=eq.${id}`,
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
            error instanceof Error ? error.message : "Could not reorder partners.",
        },
        { status: 500 }
      );
    }
  }

  if (typeof body.id !== "string" || !body.id.trim()) {
    return Response.json({ error: "Partner id is required." }, { status: 400 });
  }

  try {
    const payload = await buildPayload(body);
    const rows = await supabaseRequest<PplPartnerRow[]>(
      `/rest/v1/ppl_partners?id=eq.${body.id}`,
      {
        method: "PATCH",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      }
    );

    revalidatePath("/work");

    return Response.json({ partner: rows[0] });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not update partner.",
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
    return Response.json({ error: "Partner id is required." }, { status: 400 });
  }

  try {
    const rows = await supabaseRequest<PplPartnerRow[]>(
      `/rest/v1/ppl_partners?id=eq.${body.id}`,
      {
        method: "DELETE",
        headers: {
          Prefer: "return=representation",
        },
      }
    );

    revalidatePath("/work");

    return Response.json({ partner: rows[0] });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not delete partner.",
      },
      { status: 500 }
    );
  }
}
