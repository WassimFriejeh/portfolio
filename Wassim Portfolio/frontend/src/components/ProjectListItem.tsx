import Link from "next/link";
import type { Project } from "@/lib/types";
import { ProjectCover } from "./ProjectCover";
import { DevelopmentLabel } from "./DevelopmentLabel";

export function ProjectListItem({ project }: { project: Project }) {
  return (
    <article className="group grid gap-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:gap-8 sm:items-center">
      <Link href={`/work/${project.slug}`} className="no-underline block">
        <ProjectCover
          name={project.name}
          cover={project.coverImage}
          sizes="(max-width: 640px) 100vw, 45vw"
        />
      </Link>
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-[clamp(1.75rem,3vw,2.5rem)]">
          <Link href={`/work/${project.slug}`} className="no-underline hover:text-[var(--ink)]">
            {project.name}
          </Link>
        </h3>
        {project.shortDescription ? (
          <p className="text-[var(--muted)] max-w-prose">{project.shortDescription}</p>
        ) : null}
        {project.category ? (
          <p className="text-small text-[var(--muted)]">{project.category}</p>
        ) : null}
        <DevelopmentLabel status={project.developmentStatus} note={project.contributionNote || undefined} />
        <p className="pt-2">
          <Link
            href={`/work/${project.slug}`}
            className="text-small no-underline border-b border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
          >
            Project details
          </Link>
        </p>
      </div>
    </article>
  );
}
