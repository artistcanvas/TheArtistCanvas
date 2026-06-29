export type SiteMetadata = {
  name: string;
  websiteUrl: string;
  logoUrl: string | null;
};

function getAttribute(tag: string, name: string) {
  const pattern = new RegExp(`${name}=["']([^"']+)["']`, "i");
  return tag.match(pattern)?.[1] ?? null;
}

function normalizeUrl(url: string, baseUrl: string) {
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return null;
  }
}

function getSiteName(html: string, fallbackUrl: URL) {
  const ogSiteName = html.match(
    /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["'][^>]*>/i
  )?.[1];
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

  return (ogSiteName ?? title ?? fallbackUrl.hostname.replace(/^www\./, ""))
    .replace(/\s+/g, " ")
    .trim();
}

function findLogoUrl(html: string, baseUrl: string) {
  const linkTags = html.match(/<link[^>]+>/gi) ?? [];
  const preferredRel = ["apple-touch-icon", "icon", "shortcut icon"];

  for (const rel of preferredRel) {
    const tag = linkTags.find((item) => {
      const value = getAttribute(item, "rel")?.toLowerCase();
      return value?.includes(rel);
    });
    const href = tag ? getAttribute(tag, "href") : null;
    const normalized = href ? normalizeUrl(href, baseUrl) : null;

    if (normalized) {
      return normalized;
    }
  }

  const ogImage = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i
  )?.[1];
  const normalizedOgImage = ogImage ? normalizeUrl(ogImage, baseUrl) : null;

  if (normalizedOgImage) {
    return normalizedOgImage;
  }

  return normalizeUrl("/favicon.ico", baseUrl);
}

export async function getSiteMetadata(websiteUrl: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(websiteUrl);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return null;
  }

  const response = await fetch(parsedUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; TAC Admin Bot)",
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return {
      name: parsedUrl.hostname.replace(/^www\./, ""),
      websiteUrl: parsedUrl.toString(),
      logoUrl: normalizeUrl("/favicon.ico", parsedUrl.toString()),
    } satisfies SiteMetadata;
  }

  const html = await response.text();

  return {
    name: getSiteName(html, parsedUrl),
    websiteUrl: parsedUrl.toString(),
    logoUrl: findLogoUrl(html, parsedUrl.toString()),
  } satisfies SiteMetadata;
}
