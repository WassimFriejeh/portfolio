"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

export function WorkBrowse({
  projects,
  categories,
}: {
  projects: Project[];
  categories: string[];
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [active, setActive] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [activeCategory, projects]);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Project categories"
        className="-mx-[var(--page-pad)] mb-10 flex gap-2 overflow-x-auto px-[var(--page-pad)] pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
      >
        {["all", ...categories].map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat}
            className={`btn !min-h-10 shrink-0 ${activeCategory === cat ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[var(--muted)]">No projects in this category yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={() => setActive(project)} />
          ))}
        </div>
      )}

      <ProjectModal project={active} open={!!active} onClose={() => setActive(null)} />
    </div>
  );
}
