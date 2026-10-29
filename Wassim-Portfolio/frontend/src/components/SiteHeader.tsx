"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/#skills", label: "Skills" },
  { href: "/#work", label: "Work" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  function handleHomeClick(event: MouseEvent<HTMLAnchorElement>) {
    if (window.location.pathname !== "/") return;

    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.history.replaceState(null, "", "/");
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function handleSectionClick(event: MouseEvent<HTMLAnchorElement>, sectionId: string) {
    // Let Next navigate from another page. On the homepage, account for the
    // sticky header and always scroll, even if this section is already hashed.
    if (window.location.pathname !== "/") return;

    const section = document.getElementById(sectionId);
    if (!section) return;

    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.querySelector("header");
    const offset = header ? header.getBoundingClientRect().bottom + 16 : 96;
    const top = Math.max(0, section.getBoundingClientRect().top + window.scrollY - offset);
    window.history.replaceState(null, "", `#${sectionId}`);
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="page-pad sticky top-4 z-50">
      <div className="content-width">
        <div
          className={`flex items-center justify-between gap-4 rounded-full px-3 py-2 transition-[background-color,border-color,box-shadow] duration-300 sm:px-4 ${
            scrolled
              ? "glass-strong !rounded-full shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]"
              : "border border-transparent"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5 pl-1 no-underline" onClick={handleHomeClick}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--grad-brand)] text-sm font-bold text-white shadow-[0_6px_20px_-6px_rgba(236,72,153,0.8)]">
              WF
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">Wassim Friejeh</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 text-sm md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-[var(--muted)] no-underline transition-colors hover:bg-white/5 hover:text-white"
                onClick={(event) => handleSectionClick(event, link.href.slice(link.href.indexOf("#") + 1))}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/#contact"
            className="btn btn-primary !min-h-10 !px-5 text-sm"
            onClick={(event) => handleSectionClick(event, "contact")}
          >
            Contact me
          </Link>
        </div>
      </div>
    </header>
  );
}
