"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/lib/types";
import { publicMediaUrl } from "@/lib/media";
import { ExternalLink } from "./ExternalLink";

type Props = {
  project: Project | null;
  open: boolean;
  onClose: () => void;
};

export function ProjectModal({ project, open, onClose }: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !project || !mounted) return null;

  const cover = publicMediaUrl(project.coverImage?.url);
  const body =
    project.longDescription?.trim() ||
    project.confirmedContribution?.trim() ||
    project.shortDescription?.trim() ||
    "More detail will be added when confirmed.";

  return createPortal(
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal-panel"
      >
        <div className="relative">
          <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-solid)]">
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
          <button
            ref={closeRef}
            type="button"
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-[rgba(7,6,13,0.75)] text-white backdrop-blur transition-colors hover:bg-[rgba(25,21,40,0.92)]"
            onClick={onClose}
            aria-label="Close project details"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              {project.category ? <p className="eyebrow">{project.category}</p> : null}
              <h2 id={titleId} className="mt-2 m-0 text-3xl font-bold tracking-tight">
                {project.name}
              </h2>
            </div>
            <p className="chip m-0">
              {project.developmentStatus === "CONTRIBUTION"
                ? "Contribution"
                : "Independently developed"}
            </p>
          </div>

          <p className="m-0 whitespace-pre-wrap text-[var(--ink)] leading-relaxed">{body}</p>

          {project.confirmedContribution && project.longDescription ? (
            <p className="m-0 text-sm text-[var(--muted)]">
              <span className="text-[var(--ink)]">Confirmed work: </span>
              {project.confirmedContribution}
            </p>
          ) : null}

          {project.contributionNote ? (
            <p className="m-0 text-sm text-[var(--muted)]">{project.contributionNote}</p>
          ) : null}

          {project.detailsIncomplete ? (
            <p className="m-0 w-fit rounded-lg border border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)]">
              Some details are still being confirmed.
            </p>
          ) : null}

          {project.techTags.length > 0 ? (
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {project.techTags.map((tag) => (
                <li key={tag} className="chip">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-1">
            {project.websiteUrl ? (
              <ExternalLink href={project.websiteUrl} className="btn btn-primary">
                Visit website <span className="arrow" aria-hidden>↗</span>
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
              <p className="m-0 mb-2 text-xs text-[var(--muted)]">
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
      </div>
    </div>,
    document.body,
  );
}
