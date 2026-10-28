import Link from "next/link";
import { CV_PATH, SOCIAL } from "@/lib/site";
import { ExternalLink } from "@/components/ExternalLink";

export function SiteFooter() {
  return (
    <footer className="page-pad mt-8 border-t border-[var(--line)]">
      <div className="content-width flex flex-col gap-5 py-10 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[image:var(--grad-brand)] text-[10px] font-bold text-white">
            WF
          </span>
          © {new Date().getFullYear()} Wassim Friejeh
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/work" className="no-underline hover:text-white">
            All projects
          </Link>
          <Link href="/#contact" className="no-underline hover:text-white">
            Contact
          </Link>
          <a href={CV_PATH} target="_blank" rel="noopener noreferrer" className="no-underline hover:text-white">
            CV
          </a>
          <ExternalLink href={SOCIAL.linkedin} className="no-underline hover:text-white">
            LinkedIn
          </ExternalLink>
          <ExternalLink href={SOCIAL.instagram} className="no-underline hover:text-white">
            Instagram
          </ExternalLink>
        </div>
      </div>
    </footer>
  );
}
