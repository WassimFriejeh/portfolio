import type { Profile, Project } from "./types";
import {
  getCategories as staticCategories,
  getProjectBySlug as staticProjectBySlug,
  getPublishedProjects as staticProjects,
} from "@/data/projects";
import { getProfile as staticProfile } from "@/data/profile";

/** Public site is static — no backend API required. */
export async function getPublishedProjects(params?: {
  featured?: boolean;
  category?: string;
}): Promise<Project[]> {
  return staticProjects(params);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return staticProjectBySlug(slug);
}

export async function getCategories(): Promise<string[]> {
  return staticCategories();
}

export async function getProfile(): Promise<Profile> {
  return staticProfile();
}
