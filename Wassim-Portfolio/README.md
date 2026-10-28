# Wassim Portfolio

Personal developer portfolio for **Wassim Friejeh** (Beirut, Lebanon).

The live site is **frontend-only** (Next.js) and deploys on **Vercel alone**. Projects and profile are static JSON; contact form saves then emails from a Next.js route.

```
Wassim-Portfolio/
  frontend/   Next.js site (deploy this to Vercel)
  backend/    Legacy Express CMS (optional / local only — not required for production)
```

## Quick start (frontend only)

```bash
cd "Wassim-Portfolio/frontend"
cp .env.example .env.local   # if present; or set vars below
npm install
npm run dev                  # http://127.0.0.1:4410
```

Edit content in:

- `frontend/src/data/projects.json` — projects
- `frontend/src/data/profile.json` — name, about, socials
- `frontend/public/covers/` — project screenshots
- `frontend/public/Wassim-Friejeh-CV.pdf` — CV

## Deploy on Vercel

1. Create a Vercel project with **Root Directory** = `Wassim-Portfolio/frontend` (or `frontend` if that is the repo root layout).
2. Add environment variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Your live domain, e.g. `https://wassim.friejeh.com` |
| `DATABASE_URL` | Free [Neon](https://neon.tech) Postgres connection string (contact inbox) |
| `CONTACT_NOTIFY_EMAIL` | `wassimfriejeh@gmail.com` |
| `MAIL_HOST` | `smtp-relay.brevo.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | Brevo SMTP login |
| `MAIL_PASSWORD` | Brevo SMTP key |
| `MAIL_FROM_ADDRESS` | Verified sender |
| `MAIL_FROM_NAME` | `WassimPortfolio` |

Optional instead of Neon: set `CONTACT_SHEET_WEBHOOK_URL` (see `frontend/scripts/contact-sheet-apps-script.js`).

3. Deploy. Add your custom domain in Vercel → Domains.

Contact flow: **save first** (Neon/Sheet), **then email** (Brevo). If SMTP fails, the submission is still stored.

## Local contact env (`frontend/.env.local`)

```bash
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:4410
DATABASE_URL=postgresql://...
CONTACT_NOTIFY_EMAIL=wassimfriejeh@gmail.com
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_FROM_ADDRESS=...
MAIL_FROM_NAME=WassimPortfolio
```

## Legacy backend

The `backend/` folder is kept for optional local CMS/seed workflows. Production does not need it.
