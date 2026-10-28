import type { Project } from "@/lib/types";
import { publicMediaUrl } from "@/lib/media";

export function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const cover = publicMediaUrl(project.coverImage?.url);

  return (
    <button type="button" className="project-card gradient-border group relative flex w-full flex-col items-stretch justify-start p-0" onClick={onOpen}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-[calc(var(--radius)-1px)] bg-[var(--surface-solid)]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            width={project.coverImage?.width ?? 1200}
            height={project.coverImage?.height ?? 750}
            className="cover-img h-full w-full object-cover object-top"
            loading="lazy"
          />
        ) : (
          <div className="placeholder-cover absolute inset-0">{project.name}</div>
        )}
        <div className="cover-shade" />
        <div className="absolute left-3 top-3 flex gap-2">
          {project.featured ? (
            <span className="rounded-full bg-[image:var(--grad-brand)] px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
              Featured
            </span>
          ) : null}
        </div>
        {project.category ? (
          <span className="chip absolute bottom-3 left-3 !bg-[rgba(7,6,13,0.65)] backdrop-blur">
            {project.category}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5 text-left">
        <h3 className="m-0 text-xl font-semibold tracking-tight">{project.name}</h3>
        {project.shortDescription ? (
          <p className="m-0 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{project.shortDescription}</p>
        ) : null}
        <p className="m-0 mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-[#f9a8d4]">
          View details <span className="arrow" aria-hidden>→</span>
        </p>
      </div>
    </button>
  );
}
