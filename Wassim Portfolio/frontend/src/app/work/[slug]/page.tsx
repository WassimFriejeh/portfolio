import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getPublishedProjects } from "@/lib/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ExternalLink } from "@/components/ExternalLink";
import { publicMediaUrl } from "@/lib/media";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const projects = await getPublishedProjects();
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project" };
  return {
    title: project.name,
    description: project.shortDescription || `${project.name} — project by Wassim Friejeh`,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const cover = publicMediaUrl(project.coverImage?.url);
  const body =
    project.longDescription?.trim() ||
    project.confirmedContribution?.trim() ||
    project.shortDescription?.trim() ||
    "More detail will be added when confirmed.";

  return (
    <>
      <SiteHeader />
      <main className="page-pad">
        <div className="content-width py-14 lg:py-20">
          <p className="mb-8 text-sm text-[var(--muted)]">
            <Link href="/work" className="no-underline hover:text-[var(--ink)]">
              Work
            </Link>
            <span aria-hidden> / </span>
            <span>{project.name}</span>
          </p>

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5 flex flex-col gap-4">
              {project.category ? <p className="eyebrow">{project.category}</p> : null}
              <h1 className="m-0 text-head font-bold leading-tight tracking-tight">{project.name}</h1>
              <p className="m-0 text-sm text-[var(--muted)]">
                {project.developmentStatus === "CONTRIBUTION"
                  ? "Contribution to an existing project"
                  : "Independently developed"}
              </p>
              <p className="m-0 whitespace-pre-wrap leading-relaxed">{body}</p>

              <div className="flex flex-wrap gap-2 pt-2">
                {project.websiteUrl ? (
                  <ExternalLink href={project.websiteUrl} className="btn btn-primary">
                    Visit website
                  </ExternalLink>
                ) : null}
                {project.partnerUrl && project.partnerUrlPublic ? (
                  <ExternalLink href={project.partnerUrl} className="btn btn-ghost">
                    Partner site
                  </ExternalLink>
                ) : null}
              </div>

              {(project.androidUrl || project.iosUrl) && (
                <div className="border-t border-[var(--line)] pt-4">
                  <p className="mb-2 m-0 text-xs text-[var(--muted)]">
                    Related product apps (not native development by Wassim)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.androidUrl ? (
                      <ExternalLink href={project.androidUrl} className="btn btn-accent">
                        Download Android
                      </ExternalLink>
                    ) : null}
                    {project.iosUrl ? (
                      <ExternalLink href={project.iosUrl} className="btn btn-accent">
                        Download iOS
                      </ExternalLink>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-7">
              <div className="gradient-border overflow-hidden">
                <div className="relative aspect-[16/11] bg-[var(--surface-solid)]">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={project.coverImage?.alt || `${project.name} preview`}
                      width={project.coverImage?.width ?? 1600}
                      height={project.coverImage?.height ?? 1000}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="placeholder-cover absolute inset-0">{project.name}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
