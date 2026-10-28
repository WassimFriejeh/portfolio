# DESIGN.md — Wassim Portfolio

Public site visual system. Admin keeps the same tokens with denser Operate-mode forms.

## Direction

"Sunset aurora on ink": a near-black ground lit by drifting violet, pink, and amber glows. Bold display type with an animated gradient line, gradient-bordered cards, and pill navigation. Layout influenced by [huseinjaber.com](https://huseinjaber.com/#services).

**Not included:** certificates section, skill-percentage bars, invented metrics. The hero "Projects" count is the live number of published projects.

**Work interaction:** homepage and `/work` show project cards; click opens a modal with full project data, website/partner links, and Android/iOS download links when present (labeled as related product apps).

## Color tokens

Source: `frontend/src/styles/tokens.css`

| Token | Role | Value |
| --- | --- | --- |
| `--bg` | Page ground | `#07060D` |
| `--surface` | Glass panels | `rgba(22,18,38,0.55)` |
| `--ink` | Primary text | `#F7F5FF` |
| `--muted` | Secondary text | `#A8A3C0` |
| `--violet` | Brand start | `#8B5CF6` |
| `--pink` | Brand middle, focus, eyebrows | `#EC4899` |
| `--amber` | Brand end | `#FBBF24` |
| `--grad-brand` | Primary buttons, gradient text, card hover border | violet → pink → amber |

Each service card carries its own `--hue` for its icon tile and corner glow.

## Typography

**Albert Sans** (400–700). Type scale is exposed to Tailwind as `text-small`, `text-body`, `text-lead`, `text-head`, `text-display` (do not use `text-[var(--step-*)]` — Tailwind reads that as a color).

## Layout

1. Sticky pill nav (turns glass on scroll)  
2. Hero with aurora glow, gradient headline, live stats, fanned stack of real project covers  
3. Client marquee (published project names)  
4. About + capability chips  
5. Services (hued capability cards)  
6. Selected work (gradient-border cards + View all)  
7. Contact gradient panel  

`/work` adds category chips (horizontal scroll on mobile) and the same modal. `/work/[slug]` remains for direct/SEO links.

## Motion

Staggered rise on hero load, drifting aurora, shimmering gradient text, marquee (pauses on hover), card lift + cover zoom, modal pop-in. All respect `prefers-reduced-motion`.
