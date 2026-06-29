import { getYouTubeMetadata } from "../../../_lib/youtube";

type MetadataRequestBody = {
  youtubeUrl?: unknown;
};

export async function POST(request: Request) {
  let body: MetadataRequestBody;

  try {
    body = (await request.json()) as MetadataRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.youtubeUrl !== "string") {
    return Response.json(
      { error: "youtubeUrl must be a string." },
      { status: 400 }
    );
  }

  const metadata = await getYouTubeMetadata(body.youtubeUrl);

  if (!metadata) {
    return Response.json(
      { error: "Could not read YouTube metadata." },
      { status: 422 }
    );
  }

  return Response.json(metadata);
}
