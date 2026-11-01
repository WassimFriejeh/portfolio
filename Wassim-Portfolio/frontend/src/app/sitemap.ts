import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/api";

const siteUrl = "https://wassimfriejeh.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/work`, changeFrequency: "weekly", priority: 0.9 },
  ];

  try {
    const projects = await getPublishedProjects();
    const projectRoutes = projects.map((p) => ({
      url: `${siteUrl}/work/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: p.featured ? 0.85 : 0.7,
    }));
    return [...staticRoutes, ...projectRoutes];
  } catch {
    return staticRoutes;
  }
}
