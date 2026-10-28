import type { MediaAsset, Profile, Project } from "@prisma/client";

type ProjectWithMedia = Project & {
  coverImage: MediaAsset | null;
  gallery: MediaAsset[];
};

export function serializeMedia(asset: MediaAsset) {
  // Cache-bust so browsers pick up replaced cover files under the same path.
  // New media rows get a new id on each seed refresh.
  const joiner = asset.url.includes("?") ? "&" : "?";
  return {
    id: asset.id,
    url: `${asset.url}${joiner}v=${asset.id}`,
    alt: asset.alt,
    width: asset.width,
    height: asset.height,
    mimeType: asset.mimeType,
    sortOrder: asset.sortOrder,
    originalName: asset.originalName,
  };
}

export function serializeProject(project: ProjectWithMedia, { admin = false } = {}) {
  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    shortDescription: project.shortDescription,
    longDescription: project.longDescription,
    category: project.category,
    developmentStatus: project.developmentStatus,
    contributionNote: project.contributionNote,
    confirmedContribution: project.confirmedContribution,
    techTags: project.techTags,
    websiteUrl: project.websiteUrl,
    androidUrl: project.androidUrl,
    iosUrl: project.iosUrl,
    partnerUrl: admin || project.partnerUrlPublic ? project.partnerUrl : null,
    partnerUrlPublic: project.partnerUrlPublic,
    featured: project.featured,
    displayOrder: project.displayOrder,
    status: project.status,
    detailsIncomplete: project.detailsIncomplete,
    coverImage: project.coverImage ? serializeMedia(project.coverImage) : null,
    gallery: project.gallery.map(serializeMedia),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function serializeProfile(profile: Profile) {
  return {
    name: profile.name,
    title: profile.title,
    location: profile.location,
    introHeadline: profile.introHeadline,
    introSupport: profile.introSupport,
    about: profile.about,
    capabilities: profile.capabilities,
    email: profile.email,
    phone: profile.phone,
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
    otherLinks: profile.otherLinks,
    updatedAt: profile.updatedAt.toISOString(),
  };
}
