import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
});

export const projectWriteSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  name: z.string().min(1).max(200),
  shortDescription: z.string().max(500).optional().default(""),
  longDescription: z.string().max(10000).optional().default(""),
  category: z.string().max(120).optional().default(""),
  developmentStatus: z.enum(["INDEPENDENT", "CONTRIBUTION"]),
  contributionNote: z.string().max(500).optional().default(""),
  confirmedContribution: z.string().max(2000).optional().default(""),
  techTags: z.array(z.string().max(60)).max(20).optional().default([]),
  websiteUrl: z.string().url().nullable().optional(),
  androidUrl: z.string().url().nullable().optional(),
  iosUrl: z.string().url().nullable().optional(),
  partnerUrl: z.string().url().nullable().optional(),
  partnerUrlPublic: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  displayOrder: z.number().int().min(0).max(10000).optional().default(100),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional().default("DRAFT"),
  detailsIncomplete: z.boolean().optional().default(false),
  coverImageId: z.string().nullable().optional(),
  galleryIds: z.array(z.string()).optional(),
});

export const projectPatchSchema = projectWriteSchema.partial();

export const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        displayOrder: z.number().int().min(0).max(10000),
      }),
    )
    .min(1),
});

export const profileSchema = z.object({
  name: z.string().min(1).max(120),
  title: z.string().max(200),
  location: z.string().max(200),
  introHeadline: z.string().max(500),
  introSupport: z.string().max(500),
  about: z.string().max(4000),
  capabilities: z.string().max(1000),
  email: z.string().email().nullable().optional().or(z.literal("")),
  phone: z.string().max(40).nullable().optional().or(z.literal("")),
  linkedinUrl: z.string().url().nullable().optional().or(z.literal("")),
  githubUrl: z.string().url().nullable().optional().or(z.literal("")),
  otherLinks: z
    .array(z.object({ label: z.string().max(80), url: z.string().url() }))
    .max(10)
    .optional(),
});

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().min(10).max(5000),
});
