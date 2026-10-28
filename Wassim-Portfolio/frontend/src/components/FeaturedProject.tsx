import Link from "next/link";
import type { Project } from "@/lib/types";
import { ProjectCover } from "./ProjectCover";
import { DevelopmentLabel } from "./DevelopmentLabel";
import { ExternalLink } from "./ExternalLink";

export function FeaturedProject({
  project,
  reverse = false,
  priority = false,
}: {
  project: Project;
  reverse?: boolean;
  priority?: boolean;
}) {
  return (
    <article className="group grid gap-8 lg:grid-cols-12 lg:gap-10 lg:items-end">
      <div className={`lg:col-span-7 rise-in ${reverse ? "lg:order-2" : ""}`}>
        <ProjectCover
          name={project.name}
          cover={project.coverImage}
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 58vw"
        />
      </div>
      <div className={`lg:col-span-5 flex flex-col gap-4 ${reverse ? "lg:order-1 lg:items-end lg:text-right" : ""}`}>
        <h3 className="font-display text-[clamp(2.4rem,4vw,3.75rem)] tracking-tight">
          {project.name}
        </h3>
        <p className={`max-w-md text-lead leading-snug ${reverse ? "lg:ml-auto" : ""}`}>
          {project.shortDescription}
        </p>
        <div className={`flex flex-col gap-1 ${reverse ? "lg:items-end" : ""}`}>
          {project.category ? (
            <p className="text-small text-[var(--muted)]">{project.category}</p>
          ) : null}
          <DevelopmentLabel status={project.developmentStatus} note={project.contributionNote || undefined} />
        </div>
        <div className={`mt-2 flex flex-wrap gap-3 ${reverse ? "lg:justify-end" : ""}`}>
          <Link href={`/work/${project.slug}`} className="btn btn-primary no-underline">
            Project details
          </Link>
          {project.websiteUrl ? (
            <ExternalLink href={project.websiteUrl} className="btn btn-ghost no-underline">
              Visit website
            </ExternalLink>
          ) : null}
        </div>
      </div>
    </article>
  );
}
