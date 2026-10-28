import type { Project } from "@/lib/types";
import raw from "./projects.json";

export const projects = raw as Project[];

export function getPublishedProjects(params?: { featured?: boolean; category?: string }): Project[] {
  let list = projects.filter((p) => p.status === "PUBLISHED");
  if (params?.featured) list = list.filter((p) => p.featured);
  if (params?.category) list = list.filter((p) => p.category === params.category);
  return [...list].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return a.name.localeCompare(b.name);
  });
}

export function getProjectBySlug(slug: string): Project | null {
  return projects.find((p) => p.slug === slug && p.status === "PUBLISHED") ?? null;
}

export function getCategories(): string[] {
  const preferred = "Web application";
  const categories = [...new Set(getPublishedProjects().map((p) => p.category).filter(Boolean))].sort();
  const rest = categories.filter((c) => c !== preferred);
  return categories.includes(preferred) ? [preferred, ...rest] : rest;
}
