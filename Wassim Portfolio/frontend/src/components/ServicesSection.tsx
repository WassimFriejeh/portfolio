import type { CSSProperties, ReactNode } from "react";

const icon = (d: ReactNode) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const services: { title: string; body: string; hue: string; icon: ReactNode }[] = [
  {
    title: "Websites",
    body: "Marketing and informational sites with clear structure, responsive layouts, and dependable publishing.",
    hue: "#8b5cf6",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>,
    ),
  },
  {
    title: "Web applications",
    body: "Product-facing interfaces with auth, dashboards, and workflows shaped around real use.",
    hue: "#ec4899",
    icon: icon(
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 14h4" />
      </>,
    ),
  },
  {
    title: "Backend systems",
    body: "Server-side logic, data models, and business rules that keep applications reliable.",
    hue: "#22d3ee",
    icon: icon(
      <>
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </>,
    ),
  },
  {
    title: "APIs",
    body: "REST-style integrations between clients, partners, and internal services.",
    hue: "#fbbf24",
    icon: icon(<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />),
  },
  {
    title: "E-commerce",
    body: "Catalog, cart, and checkout experiences for brands selling online.",
    hue: "#f472b6",
    icon: icon(
      <>
        <path d="M5 7h14l-1.5 9h-11z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="16" cy="20" r="1" />
      </>,
    ),
  },
  {
    title: "Payments",
    body: "Payment flows and bill-pay style experiences where confirmed by the project scope.",
    hue: "#a3e635",
    icon: icon(
      <>
        <rect x="2.5" y="5" width="19" height="14" rx="2" />
        <path d="M2.5 10h19M6 15h3" />
      </>,
    ),
  },
  {
    title: "Admin & partners",
    body: "Merchant, partner, and operations interfaces that sit behind the public site.",
    hue: "#60a5fa",
    icon: icon(
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M17 11a3 3 0 1 0 0-6M21 20a6 6 0 0 0-4-5.6" />
      </>,
    ),
  },
  {
    title: "Deployment",
    body: "Shipping and maintaining applications in production with practical hosting setups.",
    hue: "#fb923c",
    icon: icon(
      <>
        <path d="M12 15V3M7 8l5-5 5 5" />
        <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
      </>,
    ),
  },
  {
    title: "Ongoing support",
    body: "Iteration, fixes, and feature work on existing codebases when contributing or owning delivery.",
    hue: "#c084fc",
    icon: icon(
      <>
        <path d="M20 11a8 8 0 1 0-2.3 5.7" />
        <path d="M20 4v7h-7" />
      </>,
    ),
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="page-pad scroll-mt-28 py-16 lg:py-20">
      <div className="content-width">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">Services</p>
          <h2 className="section-title mt-4">
            What I can <span className="gradient-text">build for you</span>
          </h2>
          <p className="section-sub">
            End-to-end web work — from public sites to backends, APIs, commerce, and deployment.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="service-card glass flex flex-col gap-4 p-6"
              style={{ "--hue": service.hue } as CSSProperties}
            >
              <div className="service-icon" aria-hidden>
                {service.icon}
              </div>
              <h3 className="m-0 text-xl font-semibold tracking-tight">{service.title}</h3>
              <p className="m-0 text-sm leading-relaxed text-[var(--muted)]">{service.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
