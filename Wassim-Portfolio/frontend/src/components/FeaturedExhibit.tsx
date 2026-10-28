import Link from "next/link";
import type { Project } from "@/lib/types";
import { publicMediaUrl } from "@/lib/media";
import { DevelopmentLabel } from "./DevelopmentLabel";
import { ExternalLink } from "./ExternalLink";

/** Large lit exhibit — dark-room featured piece. Layout variants avoid sameness. */
export function FeaturedExhibit({
  project,
  variant = "wide",
  priority = false,
}: {
  project: Project;
  variant?: "wide" | "offset";
  priority?: boolean;
}) {
  const src = publicMediaUrl(project.coverImage?.url);
  const width = project.coverImage?.width && project.coverImage.width > 0 ? project.coverImage.width : 1600;
  const height = project.coverImage?.height && project.coverImage.height > 0 ? project.coverImage.height : 1000;

  if (variant === "offset") {
    return (
      <article className="grid gap-8 lg:grid-cols-12 lg:gap-6 lg:items-end">
        <div className="lg:col-span-5 lg:pb-8 order-2 lg:order-1">
          <ExhibitCopy project={project} align="start" />
        </div>
        <div className="lg:col-span-7 order-1 lg:order-2 lg:translate-x-2">
          <ExhibitImage
            src={src}
            project={project}
            width={width}
            height={height}
            priority={priority}
            className="aspect-[16/11]"
          />
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col gap-8">
      <ExhibitImage
        src={src}
        project={project}
        width={width}
        height={height}
        priority={priority}
        className="aspect-[21/10] w-full"
      />
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <h3 className="font-display text-[clamp(3rem,6vw,5.5rem)] leading-none tracking-tight">
            {project.name}
          </h3>
        </div>
        <div className="lg:col-span-5 flex flex-col gap-4 lg:items-end lg:text-right">
          <p className="max-w-md text-lead leading-snug text-[var(--ink)] lg:ml-auto">
            {project.shortDescription}
          </p>
          <DevelopmentLabel status={project.developmentStatus} note={project.contributionNote || undefined} />
          <div className="flex flex-wrap gap-3 lg:justify-end">
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
      </div>
    </article>
  );
}

function ExhibitCopy({ project, align }: { project: Project; align: "start" | "end" }) {
  return (
    <div className={`flex flex-col gap-4 ${align === "end" ? "lg:items-end lg:text-right" : ""}`}>
      <h3 className="font-display text-[clamp(2.75rem,5vw,4.5rem)] leading-none tracking-tight">
        {project.name}
      </h3>
      <p className={`max-w-md text-lead leading-snug ${align === "end" ? "lg:ml-auto" : ""}`}>
        {project.shortDescription}
      </p>
      {project.category ? (
        <p className="text-small text-[var(--muted)]">{project.category}</p>
      ) : null}
      <DevelopmentLabel status={project.developmentStatus} note={project.contributionNote || undefined} />
      <div className={`mt-1 flex flex-wrap gap-3 ${align === "end" ? "lg:justify-end" : ""}`}>
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
  );
}

function ExhibitImage({
  src,
  project,
  width,
  height,
  priority,
  className,
}: {
  src: string | null;
  project: Project;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`media-frame relative overflow-hidden bg-[var(--surface)] ${className ?? ""}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={project.coverImage?.alt || `${project.name} website preview`}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      ) : (
        <div className="placeholder-cover absolute inset-0">{project.name}</div>
      )}
    </div>
  );
}
