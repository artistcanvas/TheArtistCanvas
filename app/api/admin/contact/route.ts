import { revalidatePath } from "next/cache";
import type { ContactInquiryType } from "../../../_lib/contact";
import { assertAdmin } from "../_lib/auth";

type ContactRequestBody = {
  password?: unknown;
  action?: unknown;
  id?: unknown;
  ids?: unknown;
  inquiryType?: unknown;
  email?: unknown;
  isPublished?: unknown;
  sortOrder?: unknown;
};

type ContactEmailRow = {
  id: string;
  inquiry_type: ContactInquiryType;
  email: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
};

const inquiryTypes: ContactInquiryType[] = [
  "content_production",
  "advertising_ppl",
  "casting",
  "general",
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isInquiryType(value: unknown): value is ContactInquiryType {
  return (
    typeof value === "string" &&
    inquiryTypes.includes(value as ContactInquiryType)
  );
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
    return (await request.json()) as ContactRequestBody;
  } catch {
    return null;
  }
}

function parseSortOrder(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = Number(value);

  if (!Number.isInteger(number)) {
    throw new Error("Sort order must be an integer.");
  }

  return number;
}

function buildPayload(body: ContactRequestBody) {
  if (!isInquiryType(body.inquiryType)) {
    throw new Error("Invalid inquiry type.");
  }

  if (typeof body.email !== "string" || !body.email.trim()) {
    throw new Error("Email is required.");
  }

  const email = body.email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email must be valid.");
  }

  return {
    inquiry_type: body.inquiryType,
    email,
    is_published: body.isPublished !== false,
    sort_order: parseSortOrder(body.sortOrder),
    updated_at: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  const adminError = await assertAdmin(request);

  if (adminError) {
    return adminError;
  }

  try {
    const emails = await supabaseRequest<ContactEmailRow[]>(
      "/rest/v1/contact_emails?select=id,inquiry_type,email,is_published,sort_order,created_at&order=inquiry_type.asc,sort_order.asc,created_at.asc"
    );

    return Response.json({ emails });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not load contacts.",
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
    const rows = await supabaseRequest<ContactEmailRow[]>(
      "/rest/v1/contact_emails?on_conflict=inquiry_type,email",
      {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(buildPayload(body)),
      }
    );

    revalidatePath("/contact");

    return Response.json({ email: rows[0] });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not save contact.",
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
        { error: "Contact email ids are required." },
        { status: 400 }
      );
    }

    try {
      await Promise.all(
        body.ids.map((id, index) =>
          supabaseRequest(
            `/rest/v1/contact_emails?id=eq.${encodeURIComponent(id)}`,
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

      revalidatePath("/contact");

      return Response.json({ ok: true });
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Could not reorder contacts.",
        },
        { status: 500 }
      );
    }
  }

  if (typeof body.id !== "string" || !body.id.trim()) {
    return Response.json({ error: "Contact email id is required." }, { status: 400 });
  }

  try {
    const rows = await supabaseRequest<ContactEmailRow[]>(
      `/rest/v1/contact_emails?id=eq.${encodeURIComponent(body.id)}`,
      {
        method: "PATCH",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify(buildPayload(body)),
      }
    );

    revalidatePath("/contact");

    return Response.json({ email: rows[0] });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not update contact.",
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
    return Response.json(
      { error: "Contact email id is required." },
      { status: 400 }
    );
  }

  try {
    const rows = await supabaseRequest(
      `/rest/v1/contact_emails?id=eq.${encodeURIComponent(body.id)}`,
      {
        method: "DELETE",
        headers: {
          Prefer: "return=representation",
        },
      }
    );

    revalidatePath("/contact");

    return Response.json({ email: Array.isArray(rows) ? rows[0] : rows });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not delete contact.",
      },
      { status: 500 }
    );
  }
}
