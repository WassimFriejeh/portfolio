"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Profile } from "@/lib/types";
import { CV_PATH, SOCIAL } from "@/lib/site";
import { ExternalLink } from "@/components/ExternalLink";

type Props = {
  profile: Profile | null;
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatPhoneDisplay(phone: string) {
  const digits = digitsOnly(phone);
  if (digits.startsWith("961") && digits.length >= 11) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return phone.startsWith("+") ? phone : `+${phone}`;
}

function otherLink(profile: Profile | null, label: string) {
  if (!profile || !Array.isArray(profile.otherLinks)) return null;
  const match = profile.otherLinks.find(
    (link) =>
      link &&
      typeof link === "object" &&
      "label" in link &&
      "url" in link &&
      typeof link.label === "string" &&
      typeof link.url === "string" &&
      link.label.toLowerCase() === label.toLowerCase(),
  ) as { label: string; url: string } | undefined;
  return match?.url?.trim() || null;
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ContactSection({ profile }: Props) {
  const email = profile?.email?.trim() || "wassimfriejeh@gmail.com";
  const phone = profile?.phone?.trim() || "+96171484101";
  const location = profile?.location?.trim() || "Beirut, Lebanon";
  const linkedinUrl = profile?.linkedinUrl?.trim() || SOCIAL.linkedin;
  const instagramUrl = otherLink(profile, "Instagram") || SOCIAL.instagram;
  const whatsappHref = `https://wa.me/${digitsOnly(phone)}`;

  const [name, setName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => name.trim().length > 0 && formEmail.trim().length > 0 && message.trim().length >= 10,
    [name, formEmail, message],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || status === "sending") return;
    setStatus("sending");
    setError(null);
    try {
      // Next.js route: saves first (Neon/Postgres or Google Sheet), then emails via Brevo.
      // Survives SMTP outages as long as the row is stored.
      const res = await fetch("/forms/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: formEmail.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; emailSent?: boolean };
      if (!res.ok) {
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      setStatus("success");
      setName("");
      setFormEmail("");
      setSubject("");
      setMessage("");
      if (body.emailSent === false) {
        // Saved successfully; mail may retry later from the inbox table/sheet.
        console.warn("Contact saved, but notification email was not sent.");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not send your message.");
    }
  }

  return (
    <section id="contact" className="page-pad relative scroll-mt-28 overflow-hidden pb-24 pt-12 lg:pb-28 lg:pt-16">
      <div className="contact-aurora" aria-hidden>
        <span />
        <span />
      </div>

      <div className="content-width relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="status-pill mx-auto m-0">
            <span className="status-dot" aria-hidden />
            Get in touch
          </p>
          <h2 className="section-title mt-5">
            Start your next <span className="gradient-text">project</span>
          </h2>
          <p className="section-sub">
            Need a full-stack developer for a new build, custom API, or ongoing support? Share your
            goals — I typically respond within 24 hours.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:gap-6">
          {/* Direct contact */}
          <aside className="glass contact-direct flex flex-col gap-6 p-6 sm:p-7 lg:col-span-4">
            <h3 className="m-0 text-lg font-semibold tracking-tight">Direct contact</h3>

            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              <li>
                <a href={`mailto:${email}`} className="contact-row">
                  <span className="contact-icon" aria-hidden>
                    <svg {...iconProps}>
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 7 9-7" />
                    </svg>
                  </span>
                  <span className="min-w-0 break-all">{email}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${digitsOnly(phone)}`} className="contact-row">
                  <span className="contact-icon" aria-hidden>
                    <svg {...iconProps}>
                      <path d="M7 3h4l1.5 4.5-2.5 1.5a12 12 0 0 0 5 5l1.5-2.5L21 13v4a2 2 0 0 1-2 2A14 14 0 0 1 5 5a2 2 0 0 1 2-2z" />
                    </svg>
                  </span>
                  <span>{formatPhoneDisplay(phone)}</span>
                </a>
              </li>
              <li className="contact-row !cursor-default">
                <span className="contact-icon" aria-hidden>
                  <svg {...iconProps}>
                    <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>
                <span>{location}</span>
              </li>
            </ul>

            <div className="mt-auto flex flex-col gap-4 pt-2">
              <div className="flex flex-wrap gap-2.5">
                {profile?.githubUrl ? (
                  <ExternalLink href={profile.githubUrl} className="contact-social" aria-label="GitHub">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.8c.85 0 1.7.12 2.5.34 1.9-1.32 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .26.18.59.69.48A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
                    </svg>
                  </ExternalLink>
                ) : null}
                <ExternalLink href={linkedinUrl} className="contact-social" aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M6.94 8.5H3.75V20h3.19V8.5zM5.34 7.08a1.85 1.85 0 1 0 0-3.7 1.85 1.85 0 0 0 0 3.7zM20.25 20h-3.18v-5.6c0-1.33-.02-3.05-1.86-3.05-1.86 0-2.15 1.45-2.15 2.95V20H9.88V8.5h3.05v1.57h.04c.43-.8 1.47-1.65 3.02-1.65 3.23 0 3.83 2.13 3.83 4.9V20z" />
                  </svg>
                </ExternalLink>
                <ExternalLink href={instagramUrl} className="contact-social" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.9A3.1 3.1 0 1 1 12 8.9a3.1 3.1 0 0 1 0 6.2z" />
                    <path d="M17.5 6.3a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0z" />
                    <path d="M12 2.5c-2.6 0-2.9 0-4 .06-2.7.12-4 1.45-4.12 4.12C3.8 7.7 3.8 8 3.8 10.6s0 2.9.06 4c.12 2.67 1.45 4 4.12 4.12 1.08.05 1.38.06 4 .06s2.9 0 4-.06c2.67-.12 4-1.45 4.12-4.12.05-1.08.06-1.38.06-4s0-2.9-.06-4c-.12-2.67-1.45-4-4.12-4.12-1.1-.05-1.4-.06-4-.06zm0 1.53c2.55 0 2.85 0 3.86.06 1.92.09 2.82.98 2.9 2.9.06 1 .06 1.3.06 3.85s0 2.85-.06 3.86c-.09 1.91-.98 2.81-2.9 2.9-1 .05-1.3.06-3.86.06s-2.85 0-3.86-.06c-1.92-.09-2.81-.99-2.9-2.9-.05-1-.06-1.3-.06-3.86s0-2.85.06-3.85c.09-1.92.98-2.81 2.9-2.9 1-.06 1.3-.06 3.86-.06z" />
                  </svg>
                </ExternalLink>
                <ExternalLink href={whatsappHref} className="contact-social" aria-label="WhatsApp">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12.04 2c-5.46 0-9.9 4.43-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.43 9.9-9.9S17.5 2 12.04 2zm5.78 14.05c-.24.68-1.4 1.25-1.95 1.33-.5.07-1.13.1-1.83-.12-.42-.13-.97-.32-1.67-.62-2.94-1.27-4.85-4.23-5-4.42-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36h.56c.18 0 .42-.07.66.5.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.14.31-.28.48-.14.17-.3.38-.42.51-.14.14-.29.29-.12.57.16.28.73 1.2 1.57 1.94 1.08.96 1.99 1.26 2.27 1.4.28.14.45.12.61-.07.17-.19.7-.81.88-1.09.19-.28.37-.23.62-.14.26.1 1.63.77 1.91.91.28.14.47.21.54.33.07.12.07.68-.17 1.36z" />
                  </svg>
                </ExternalLink>
              </div>

              <a
                href={CV_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost !min-h-11 w-full !justify-between !rounded-[0.9rem] !px-4"
              >
                View CV
                <span className="arrow" aria-hidden>
                  →
                </span>
              </a>
            </div>
          </aside>

          {/* Form */}
          <div className="glass p-6 sm:p-8 lg:col-span-8">
            {status === "success" ? (
              <div className="grid min-h-[22rem] place-items-center text-center" role="status">
                <div>
                  <p className="m-0 text-head font-bold tracking-tight">Message sent</p>
                  <p className="mt-3 m-0 text-[var(--muted)]">
                    Thanks — I&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    type="button"
                    className="btn btn-ghost mt-8"
                    onClick={() => setStatus("idle")}
                  >
                    Send another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="contact-label" htmlFor="contact-name">
                      Name <span className="req">*</span>
                    </label>
                    <input
                      id="contact-name"
                      className="contact-input"
                      name="name"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="contact-label" htmlFor="contact-email">
                      Email <span className="req">*</span>
                    </label>
                    <input
                      id="contact-email"
                      className="contact-input"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="contact-label" htmlFor="contact-subject">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    className="contact-input"
                    name="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className="contact-label" htmlFor="contact-message">
                    Message <span className="req">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    className="contact-input min-h-[9.5rem] resize-y"
                    name="message"
                    required
                    minLength={10}
                    placeholder="Tell me about your project, timeline, and goals..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {error ? (
                  <p className="m-0 text-sm text-[var(--danger)]" role="alert">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="btn btn-primary !min-h-12 w-full !rounded-[0.9rem]"
                  disabled={!canSubmit || status === "sending"}
                >
                  {status === "sending" ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
