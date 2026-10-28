import type { Metadata } from "next";
import { getCategories, getPublishedProjects } from "@/lib/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WorkBrowse } from "@/components/WorkBrowse";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected websites, web applications, and backend projects by Wassim Friejeh.",
};

export default async function WorkPage() {
  const [projects, categories] = await Promise.all([getPublishedProjects(), getCategories()]);

  return (
    <>
      <SiteHeader />
      <main className="relative isolate -mt-[4.75rem] overflow-hidden page-pad">
        <div className="aurora !opacity-60" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="content-width relative z-10 pb-14 pt-[8.5rem] lg:pb-20 lg:pt-[10rem]">
          <div className="max-w-2xl">
            <p className="eyebrow rise">Portfolio</p>
            <h1 className="rise rise-1 mt-4 m-0 text-display font-bold leading-[0.98] tracking-[-0.045em]">
              All <span className="gradient-text">work</span>
            </h1>
            <p className="rise rise-2 mt-5 m-0 text-lead text-[var(--muted)]">
              Click a project for details, links, and related app downloads when available.
            </p>
          </div>

          <div className="mt-12">
            <WorkBrowse projects={projects} categories={categories} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
