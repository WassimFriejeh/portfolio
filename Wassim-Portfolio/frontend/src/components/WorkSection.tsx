"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

export function WorkSection({
  projects,
  title = "Selected work",
  subtitle = "Featured projects and a selection of recent websites and applications.",
  showViewAll = true,
  limit,
}: {
  projects: Project[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  limit?: number;
}) {
  const [active, setActive] = useState<Project | null>(null);
  const list = typeof limit === "number" ? projects.slice(0, limit) : projects;

  return (
    <section className="page-pad py-16 lg:py-20">
      <div id="work" className="content-width scroll-mt-28">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow">Portfolio</p>
            <h2 className="section-title mt-4">{title}</h2>
            <p className="mt-4 m-0 text-[var(--muted)]">{subtitle}</p>
          </div>
          {showViewAll ? (
            <Link href="/work" className="btn btn-ghost shrink-0">
              View all projects <span className="arrow" aria-hidden>→</span>
            </Link>
          ) : null}
        </div>

        {list.length === 0 ? (
          <p className="mt-12 text-center text-[var(--muted)]">No published projects yet.</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={() => setActive(project)} />
            ))}
          </div>
        )}
      </div>

      <ProjectModal project={active} open={!!active} onClose={() => setActive(null)} />
    </section>
  );
}
