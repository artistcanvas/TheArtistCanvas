import type { MetadataRoute } from "next";

const siteUrl = "https://www.the-artistcanvas.com";

const routes = [
  { path: "/", priority: 1 },
  { path: "/artist", priority: 0.8 },
  { path: "/work", priority: 0.8 },
  { path: "/contact", priority: 0.7 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map(({ path, priority }) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified,
    changeFrequency: "monthly",
    priority,
  }));
}
