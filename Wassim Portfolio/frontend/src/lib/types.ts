export type DevelopmentStatus = "INDEPENDENT" | "CONTRIBUTION";
export type PublishStatus = "DRAFT" | "PUBLISHED";

export type MediaAsset = {
  id: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  mimeType: string;
  sortOrder: number;
  originalName?: string;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  developmentStatus: DevelopmentStatus;
  contributionNote: string;
  confirmedContribution: string;
  techTags: string[];
  websiteUrl: string | null;
  androidUrl: string | null;
  iosUrl: string | null;
  partnerUrl: string | null;
  partnerUrlPublic: boolean;
  featured: boolean;
  displayOrder: number;
  status: PublishStatus;
  detailsIncomplete: boolean;
  coverImage: MediaAsset | null;
  gallery: MediaAsset[];
  createdAt: string;
  updatedAt: string;
};

export type Profile = {
  name: string;
  title: string;
  location: string;
  introHeadline: string;
  introSupport: string;
  about: string;
  capabilities: string;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  otherLinks: { label: string; url: string }[] | unknown;
  updatedAt: string;
};
