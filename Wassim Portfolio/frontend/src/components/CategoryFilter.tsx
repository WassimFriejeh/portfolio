"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { ProjectListItem } from "./ProjectListItem";

export function CategoryFilter({
  projects,
  categories,
}: {
  projects: Project[];
  categories: string[];
}) {
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(() => {
    if (active === "all") return projects;
    return projects.filter((p) => p.category === active);
  }, [active, projects]);

  return (
    <div className="flex flex-col gap-10">
      <div role="tablist" aria-label="Project categories" className="flex flex-wrap gap-2">
        <button
          type="button"
          role="tab"
          aria-selected={active === "all"}
          className={`btn ${active === "all" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setActive("all")}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={active === cat}
            className={`btn ${active === cat ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setActive(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[var(--muted)]">No projects in this category yet.</p>
      ) : (
        <div className="flex flex-col gap-16">
          {filtered.map((project) => (
            <ProjectListItem key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
