import Link from "next/link";
import { getProfile, getPublishedProjects } from "@/lib/api";
import { publicMediaUrl } from "@/lib/media";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ServicesSection } from "@/components/ServicesSection";
import { SkillsSection } from "@/components/SkillsSection";
import { WorkSection } from "@/components/WorkSection";
import { ContactSection } from "@/components/ContactSection";
import { CV_PATH } from "@/lib/site";

const stack = ["Websites", "Web apps", "Backend systems", "REST APIs", "E-commerce", "Payments", "Deployment"];

export default async function HomePage() {
  const [projects, profile] = await Promise.all([getPublishedProjects(), getProfile()]);

  const featuredFirst = [
    ...projects.filter((p) => p.featured),
    ...projects.filter((p) => !p.featured),
  ];

  const heroCovers = featuredFirst
    .map((p) => ({ name: p.name, src: publicMediaUrl(p.coverImage?.url) }))
    .filter((p): p is { name: string; src: string } => Boolean(p.src))
    .slice(0, 3);

  const support =
    profile?.introSupport ?? "Full-stack developer building web applications, backend systems, and APIs.";
  const about =
    profile?.about ??
    "Based in Beirut, Lebanon, with three years of professional experience across websites, web applications, backend systems, APIs, e-commerce, payment integrations, and deployment.";
  const location = profile?.location ?? "Beirut, Lebanon";
  const email = profile?.email?.trim() || "wassimfriejeh@gmail.com";

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative isolate -mt-[4.75rem] overflow-hidden page-pad pb-20 pt-[8.5rem] lg:pb-28 lg:pt-[10rem]">
          <div className="aurora" aria-hidden>
            <span />
            <span />
            <span />
          </div>

          <div className="content-width relative z-10 grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <p className="status-pill rise m-0">
                <span className="status-dot" aria-hidden />
                Open to new projects
              </p>

              <h1 className="rise rise-1 mt-7 m-0 text-display font-bold leading-[0.98] tracking-[-0.045em]">
                Hi, I&apos;m Wassim.
                <br />
                <span className="gradient-text">I build for the web.</span>
              </h1>

              <p className="rise rise-2 mt-7 m-0 max-w-xl text-lead leading-relaxed text-[var(--muted)]">
                {support} Including e-commerce and payment work when the project needs it.
              </p>

              <div className="rise rise-3 mt-9 flex flex-wrap gap-3">
                <Link href="#work" className="btn btn-primary">
                  View my work <span className="arrow" aria-hidden>→</span>
                </Link>
                <Link href="#contact" className="btn btn-ghost">
                  Get in touch
                </Link>
                <a
                  href={CV_PATH}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                >
                  View CV
                </a>
              </div>

              <dl className="rise rise-4 mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-[var(--line)] pt-6">
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Experience</dt>
                  <dd className="m-0 mt-1 text-3xl font-bold tracking-tight">3+ yrs</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Projects</dt>
                  <dd className="m-0 mt-1 text-3xl font-bold tracking-tight">
                    {projects.length > 0 ? projects.length : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Based in</dt>
                  <dd className="m-0 mt-1 text-base font-semibold leading-tight">{location}</dd>
                  <dd className="m-0 mt-1.5">
                    <a
                      href={`mailto:${email}`}
                      className="break-all text-sm font-medium text-[var(--muted)] no-underline transition-colors hover:text-white"
                    >
                      {email}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="relative hidden h-[32rem] lg:col-span-5 lg:block" aria-hidden>
              {heroCovers.length > 0 ? (
                heroCovers.map((cover, i) => (
                  <figure
                    key={cover.name}
                    className="rise gradient-border absolute m-0 w-[82%] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)]"
                    style={{
                      top: `${[0, 8.5, 17][i]}rem`,
                      left: `${[0, 18, 6][i]}%`,
                      transform: `rotate(${[-5, 4, -2][i]}deg)`,
                      zIndex: 10 + i,
                      animationDelay: `${200 + i * 120}ms`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover.src} alt="" className="aspect-[16/10] w-full object-cover object-top" />
                    <figcaption className="absolute bottom-3 left-3 chip !bg-[rgba(7,6,13,0.7)] backdrop-blur">
                      {cover.name}
                    </figcaption>
                  </figure>
                ))
              ) : (
                <div className="gradient-border grid h-full place-items-center p-8 text-center">
                  <p className="m-0 text-head font-bold gradient-text">Full-stack</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Client marquee */}
        {featuredFirst.length > 0 ? (
          <section aria-label="Projects I have worked on" className="border-y border-[var(--line)] bg-[rgba(255,255,255,0.015)] py-6">
            <div className="marquee">
              <div className="marquee-track">
                {[...featuredFirst, ...featuredFirst].map((p, i) => (
                  <span
                    key={`${p.id}-${i}`}
                    className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-[rgba(247,245,255,0.55)]"
                    aria-hidden={i >= featuredFirst.length}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--pink)]" />
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* About */}
        <section className="page-pad py-20 lg:py-28">
          <div id="about" className="content-width grid scroll-mt-28 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow">About me</p>
              <h2 className="section-title mt-4">
                Building things that <span className="gradient-text">ship and last.</span>
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="m-0 text-lead leading-relaxed text-[var(--ink)]">{about}</p>
              {profile?.capabilities ? (
                <p className="mt-6 m-0 text-sm leading-relaxed text-[var(--muted)]">{profile.capabilities}</p>
              ) : null}
              <ul className="mt-8 flex list-none flex-wrap gap-2 p-0">
                {stack.map((item) => (
                  <li key={item} className="chip">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <ServicesSection />

        <SkillsSection />

        <WorkSection projects={featuredFirst} limit={6} showViewAll />

        <ContactSection profile={profile} />
      </main>
      <SiteFooter />
    </>
  );
}
