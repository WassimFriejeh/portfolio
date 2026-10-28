"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/lib/types";
import { publicMediaUrl } from "@/lib/media";

/**
 * Dark-room work blueprint: big names as the index,
 * sticky lit preview on the right (desktop). Live interaction = hover/focus swap.
 */
export function WorkNameIndex({ projects }: { projects: Project[] }) {
  const [activeId, setActiveId] = useState(projects[0]?.id ?? "");
  const active = projects.find((p) => p.id === activeId) ?? projects[0];

  if (projects.length === 0) return null;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8 lg:items-start">
      <div className="lg:col-span-7">
        <ul className="m-0 list-none p-0">
          {projects.map((project) => {
            const isActive = project.id === active?.id;
            return (
              <li key={project.id}>
                <Link
                  href={`/work/${project.slug}`}
                  className="group flex flex-col gap-1 border-0 py-2.5 no-underline outline-none sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  onMouseEnter={() => setActiveId(project.id)}
                  onFocus={() => setActiveId(project.id)}
                >
                  <span
                    className="font-display text-[clamp(2.5rem,5.2vw,4.75rem)] leading-none tracking-tight transition-colors duration-[var(--duration-hover)]"
                    style={{ color: isActive ? "var(--ink)" : "var(--muted)" }}
                  >
                    {project.name}
                  </span>
                  <span className="shrink-0 text-small text-[var(--muted)] sm:text-right">
                    {project.category || (project.developmentStatus === "CONTRIBUTION" ? "Contribution" : "Independent")}
                  </span>
                </Link>
                {/* Mobile: image under each name */}
                <div className="mb-8 mt-2 lg:hidden">
                  <Link href={`/work/${project.slug}`} className="block no-underline">
                    <MobileCover project={project} />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="relative hidden lg:col-span-5 lg:block">
        <div className="sticky top-[18vh]">
          <div className="media-frame relative aspect-[4/5] w-full max-w-[26vw] ml-auto overflow-hidden bg-[var(--surface)]">
            {projects.map((project) => {
              const src = publicMediaUrl(project.coverImage?.url);
              const shown = project.id === active?.id;
              return (
                <div
                  key={project.id}
                  className="absolute inset-0 transition-opacity duration-[var(--duration-swap)] ease-[var(--ease-out)]"
                  style={{ opacity: shown ? 1 : 0 }}
                  aria-hidden={!shown}
                >
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt=""
                      width={project.coverImage?.width ?? 1200}
                      height={project.coverImage?.height ?? 1500}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="placeholder-cover absolute inset-0">{project.name}</div>
                  )}
                </div>
              );
            })}
          </div>
          {active ? (
            <p className="mt-4 max-w-[26vw] ml-auto text-small text-[var(--muted)] text-right">
              {active.shortDescription}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MobileCover({ project }: { project: Project }) {
  const src = publicMediaUrl(project.coverImage?.url);
  if (!src) {
    return <div className="placeholder-cover aspect-[16/10]">{project.name}</div>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={project.coverImage?.alt || `${project.name} preview`}
      width={project.coverImage?.width ?? 1600}
      height={project.coverImage?.height ?? 1000}
      className="aspect-[16/10] w-full object-cover object-top"
      loading="lazy"
    />
  );
}
