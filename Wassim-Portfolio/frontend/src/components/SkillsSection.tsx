import type { CSSProperties } from "react";

const skillGroups = [
  {
    title: "Backend",
    description: "The application layer, data, and APIs behind the experience.",
    accent: "violet",
    skills: [
      { name: "Laravel", level: 95 },
      { name: "PHP", level: 85 },
      { name: "REST APIs", level: 95 },
      { name: "MySQL", level: 88 },
    ],
  },
  {
    title: "Frontend",
    description: "Responsive interfaces built for clear, useful interactions.",
    accent: "cyan",
    skills: [
      { name: "React", level: 80 },
      { name: "Next.js", level: 85 },
      { name: "Livewire", level: 90 },
      { name: "Alpine.js", level: 90 },
      { name: "Tailwind CSS", level: 100 },
      { name: "CSS", level: 100 },
      { name: "JavaScript", level: 100 },
    ],
  },
  {
    title: "Shipping",
    description: "Practical deployment and version-control workflows for production.",
    accent: "pink",
    skills: [
      { name: "AWS", level: 75 },
      { name: "Git", level: 100 },
      { name: "Vercel", level: 85 },
    ],
  },
] as const;

export function SkillsSection() {
  return (
    <section className="skills-section page-pad py-20 lg:py-28">
      <div id="skills" className="content-width scroll-mt-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">Skills &amp; technologies</p>
          <h2 className="section-title mt-4">
            Skills for the <span className="gradient-text">full picture.</span>
          </h2>
          <p className="section-sub">
            A practical full-stack toolkit, from the application layer to a polished interface and launch.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {skillGroups.map((group, index) => (
            <article key={group.title} className={`skills-card glass skills-card-${group.accent}`}>
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="skills-card-index">0{index + 1}</p>
                  <h3 className="m-0 mt-2 text-xl font-semibold tracking-tight">{group.title}</h3>
                </div>
                <span className="skills-card-orb" aria-hidden />
              </div>
              <p className="mt-4 mb-0 text-sm leading-relaxed text-[var(--muted)]">{group.description}</p>
              <ul className="skills-list" aria-label={`${group.title} skills`}>
                {group.skills.map((skill) => (
                  <li key={skill.name}>
                    <div className="skills-list-label">
                      <span>{skill.name}</span>
                      <span>{skill.level}%</span>
                    </div>
                    <span className="skills-progress" aria-hidden>
                      <span style={{ "--skill-level": `${skill.level}%` } as CSSProperties} />
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
