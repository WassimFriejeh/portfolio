-- CreateEnum
CREATE TYPE "DevelopmentStatus" AS ENUM ('INDEPENDENT', 'CONTRIBUTION');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT 'Wassim Friejeh',
    "title" TEXT NOT NULL DEFAULT 'Full-stack developer',
    "location" TEXT NOT NULL DEFAULT 'Aramoun, Lebanon',
    "introHeadline" TEXT NOT NULL DEFAULT 'Hey, I''m Wassim.
I build what you see—and what makes it work.',
    "introSupport" TEXT NOT NULL DEFAULT 'Full-stack developer building web applications, backend systems, and APIs.',
    "about" TEXT NOT NULL DEFAULT 'Based in Aramoun, Lebanon, with three years of professional experience across websites, web applications, backend systems, APIs, e-commerce, payment integrations, and deployment.',
    "capabilities" TEXT NOT NULL DEFAULT 'Websites · Web applications · Backend systems · APIs · E-commerce · Payments · Deployment',
    "email" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "otherLinks" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL DEFAULT '',
    "longDescription" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "developmentStatus" "DevelopmentStatus" NOT NULL DEFAULT 'INDEPENDENT',
    "contributionNote" TEXT NOT NULL DEFAULT '',
    "confirmedContribution" TEXT NOT NULL DEFAULT '',
    "techTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "websiteUrl" TEXT,
    "androidUrl" TEXT,
    "iosUrl" TEXT,
    "partnerUrl" TEXT,
    "partnerUrlPublic" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 100,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "coverImageId" TEXT,
    "detailsIncomplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_coverImageId_key" ON "Project"("coverImageId");

-- CreateIndex
CREATE INDEX "Project_status_featured_displayOrder_idx" ON "Project"("status", "featured", "displayOrder");

-- CreateIndex
CREATE INDEX "Project_category_idx" ON "Project"("category");

-- CreateIndex
CREATE INDEX "MediaAsset_projectId_sortOrder_idx" ON "MediaAsset"("projectId", "sortOrder");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
