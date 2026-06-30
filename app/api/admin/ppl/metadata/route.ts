import { getSiteMetadata } from "../../../../_lib/siteMetadata";
import { assertAdmin } from "../../_lib/auth";

type MetadataBody = {
  password?: unknown;
  websiteUrl?: unknown;
};

export async function POST(request: Request) {
  let body: MetadataBody;

  try {
    body = (await request.json()) as MetadataBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const adminError = await assertAdmin(request, body);

  if (adminError) {
    return adminError;
  }

  if (typeof body.websiteUrl !== "string" || !body.websiteUrl.trim()) {
    return Response.json({ error: "Website URL is required." }, { status: 400 });
  }

  const metadata = await getSiteMetadata(body.websiteUrl.trim());

  if (!metadata) {
    return Response.json(
      { error: "Could not read site metadata." },
      { status: 422 }
    );
  }

  return Response.json(metadata);
}
