import { getSiteMetadata } from "../../../../_lib/siteMetadata";

type MetadataBody = {
  password?: unknown;
  websiteUrl?: unknown;
};

const adminPassword = process.env.ADMIN_PASSWORD;

export async function POST(request: Request) {
  let body: MetadataBody;

  try {
    body = (await request.json()) as MetadataBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!adminPassword || body.password !== adminPassword) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
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
