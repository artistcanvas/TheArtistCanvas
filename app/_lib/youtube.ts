export type YouTubeMetadata = {
  source: "youtube-data-api" | "youtube-oembed";
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
  channelId: string | null;
  channelName: string;
  channelProfileImageUrl: string | null;
};

type YouTubeDataVideoResponse = {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      channelId?: string;
      channelTitle?: string;
      thumbnails?: Record<string, { url?: string }>;
    };
  }>;
};

type YouTubeDataChannelResponse = {
  items?: Array<{
    snippet?: {
      thumbnails?: Record<string, { url?: string }>;
    };
  }>;
};

type YouTubeOEmbedResponse = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
};

function pickLargestThumbnail(
  thumbnails: Record<string, { url?: string }> | undefined
) {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    null
  );
}

export function getYouTubeVideoId(youtubeUrl: string) {
  try {
    const url = new URL(youtubeUrl);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (!hostname.endsWith("youtube.com")) {
      return null;
    }

    if (url.pathname === "/watch") {
      return url.searchParams.get("v");
    }

    const [route, videoId] = url.pathname.split("/").filter(Boolean);

    if (["embed", "shorts", "live"].includes(route)) {
      return videoId ?? null;
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeThumbnailUrl(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

async function getMetadataWithYouTubeDataApi(
  videoId: string,
  apiKey: string
): Promise<YouTubeMetadata | null> {
  const videoUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  videoUrl.searchParams.set("part", "snippet");
  videoUrl.searchParams.set("id", videoId);
  videoUrl.searchParams.set("key", apiKey);

  const videoResponse = await fetch(videoUrl, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!videoResponse.ok) {
    return null;
  }

  const videoData = (await videoResponse.json()) as YouTubeDataVideoResponse;
  const video = videoData.items?.[0];
  const snippet = video?.snippet;

  if (!video || !snippet?.title || !snippet.channelTitle) {
    return null;
  }

  let channelProfileImageUrl: string | null = null;

  if (snippet.channelId) {
    const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
    channelUrl.searchParams.set("part", "snippet");
    channelUrl.searchParams.set("id", snippet.channelId);
    channelUrl.searchParams.set("key", apiKey);

    const channelResponse = await fetch(channelUrl, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (channelResponse.ok) {
      const channelData =
        (await channelResponse.json()) as YouTubeDataChannelResponse;
      channelProfileImageUrl = pickLargestThumbnail(
        channelData.items?.[0]?.snippet?.thumbnails
      );
    }
  }

  return {
    source: "youtube-data-api",
    videoId: video.id,
    title: snippet.title,
    thumbnailUrl: pickLargestThumbnail(snippet.thumbnails) ?? getYouTubeThumbnailUrl(video.id),
    channelId: snippet.channelId ?? null,
    channelName: snippet.channelTitle,
    channelProfileImageUrl,
  };
}

async function getMetadataWithOEmbed(
  youtubeUrl: string,
  videoId: string
): Promise<YouTubeMetadata | null> {
  const oEmbedUrl = new URL("https://www.youtube.com/oembed");
  oEmbedUrl.searchParams.set("url", youtubeUrl);
  oEmbedUrl.searchParams.set("format", "json");

  const response = await fetch(oEmbedUrl, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as YouTubeOEmbedResponse;

  if (!data.title || !data.author_name) {
    return null;
  }

  return {
    source: "youtube-oembed",
    videoId,
    title: data.title,
    thumbnailUrl: data.thumbnail_url ?? getYouTubeThumbnailUrl(videoId),
    channelId: null,
    channelName: data.author_name,
    channelProfileImageUrl: null,
  };
}

export async function getYouTubeMetadata(youtubeUrl: string) {
  const videoId = getYouTubeVideoId(youtubeUrl);

  if (!videoId) {
    return null;
  }

  const apiKey = process.env.YOUTUBE_DATA_API_KEY;

  if (apiKey) {
    const metadata = await getMetadataWithYouTubeDataApi(videoId, apiKey);

    if (metadata) {
      return metadata;
    }
  }

  return getMetadataWithOEmbed(youtubeUrl, videoId);
}
