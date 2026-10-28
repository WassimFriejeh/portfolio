# AGENTS.md — Wassim Portfolio

Persistent instructions for agents working in this repository.

## Project

Personal developer portfolio for **Wassim Friejeh** (full-stack developer, Aramoun, Lebanon) plus a small CMS.

```
Wassim Portfolio/
  frontend/   Next.js (TypeScript, Tailwind) — public site + /admin
  backend/    Express (TypeScript) + PostgreSQL (Prisma) — API, auth, CMS
```

## Installed skills (use them; do not invent commands)

| Skill | Location | Use for |
| --- | --- | --- |
| Emil Kowalski (animate, emil-design-eng, …) | `.agents/skills/` | Interaction, easing, duration, reduced-motion |
| Taste skill (`design-taste-frontend`) | `.agents/skills/design-taste-frontend/` | Composition, type, anti-slop; `scripts/draw.mjs`, `inspect.mjs` |
| Impeccable | `.cursor/skills/impeccable/` | Design context, critique, polish, craft floor; `scripts/impeccable` |
| Playwright | `frontend/` | E2E, screenshots at 390 / 768 / 1440 |

Direction sheet (taste): `.taste-skill/direction.json` — **dark-room**, adapted for near-black + provisional accent (see `DESIGN.md`).

### Useful commands

```bash
# Taste
node .agents/skills/design-taste-frontend/scripts/draw.mjs --show
node .agents/skills/design-taste-frontend/scripts/inspect.mjs <url>

# Impeccable
.cursor/skills/impeccable/scripts/impeccable detect <path>
.cursor/skills/impeccable/scripts/impeccable help

# Frontend
cd frontend && npm run dev          # http://127.0.0.1:4410
cd frontend && npm run build && npm run lint && npx tsc --noEmit
cd frontend && npx playwright test

# Backend
cd backend && npm run dev           # http://127.0.0.1:4411
cd backend && npm run build && npx tsc --noEmit
cd backend && npm run db:migrate && npm run db:seed
cd backend && npm run admin:create -- --email you@example.com --password '…'
```

## Content accuracy (non-negotiable)

- Projects are independently developed unless marked as **contribution** (ABC, Monty Booking, Madame Coco Lebanon, Patchi).
- “Independently developed” = development responsibility; do **not** claim client/brand/IP ownership.
- Do **not** claim native Android/iOS development. App store links are related product apps.
- Do **not** invent technologies, features, metrics, team sizes, or commercial results.
- Keep unknown details empty or CMS-flagged. No “15+ projects” marketing claims.
- Never publish private admin URLs or sensitive screenshots as public demos.
- Do not invent email, LinkedIn, or GitHub; hide missing contact links.

## Design principles

- Near-black ground; **provisional** accent only via CSS tokens in `frontend/src/styles/tokens.css`.
- Strong typography, compact intro, large featured previews (BEWE, Pool), varied layouts.
- No SaaS landing tropes, fake metrics, glowing glassmorphism, typewriter heroes, scroll hijacking.
- Public site is Experience mode; admin is Operate mode (quiet, task-first).
- Respect `prefers-reduced-motion`. Keyboard focus must be visible.

## Architecture rules

- Database is authoritative after seed. No duplicate conflicting project lists in the frontend.
- Every write API requires authenticated admin session; UI protection alone is insufficient.
- Uploads go through storage adapter (local in dev; object storage in deploy). Validate type/size.
- No microservices, queues, WebSockets, or localStorage auth tokens.

## Verification before claiming “done”

1. Typecheck + lint + production builds for frontend and backend.
2. Playwright: public pages at 390 / 768 / 1440; admin login; CRUD; draft privacy; filters.
3. Inspect screenshots for overflow, contrast, spacing, image distortion.
4. Confirm unauthenticated writes return 401/403.
