# PROGRESS.md — Timeless

Last updated: 2026-02-26

## What's Built

### Frontend App (`apps/frontend/`)
Vite 7.3 + React + Tailwind v4 + Framer Motion + Zustand. Dev server runs on `localhost:5173`.

**Entry point:** `src/main.jsx` → `src/App.jsx`

**Components:**

| File | Purpose | Status |
|------|---------|--------|
| `src/App.jsx` | Root layout. Mobile frame (max-w-390px, centered, dark border). AnimatePresence switches between LocationSelector and experience view. | Working |
| `src/components/LocationSelector.jsx` | Landing screen. 5 staggered-animated cards showing location name, subtext, era count badge, and tagline. Tapping a card sets the location in the store. | Working |
| `src/components/ExperienceWindow.jsx` | Full-bleed background image with Ken Burns zoom (20s cycle). Cross-dissolve transitions (600ms). Dark vignette overlay (radial + bottom gradient). Era label badge (top-left, color-coded). InfoCard (slides up from bottom, glassmorphic surface card with backdrop-blur-xl). Shimmer loading state while images load. Close button (top-right) to return to LocationSelector. | Working |
| `src/components/TemporalRibbon.jsx` | Horizontal scrollable row of circular era nodes. Node size 44px, gap 48px. Amber (#C8860A) for past, white (#F5F5F5) for present, blue (#1E4D8C) for future. Selected node gets spring-animated glow ring + scale-up. Year labels in monospace (13px). Auto-centers selected node via smooth scroll. Fade gradients on left/right edges. whileTap scale feedback. | Working |

**State management:** `src/store/useStore.js`
- `locations` — loaded from `packages/content/locations.json`
- `selectedLocation` — null (show LocationSelector) or location ID (show experience)
- `setSelectedLocation(id)` — sets location, populates eras, selects first era. Pass null to return to selector.
- `eras` — array of eras for current location
- `selectedEra` — current era ID
- `setSelectedEra(id)` — sets current era

**Styling:** `src/index.css`
- Tailwind v4 with `@tailwindcss/vite` plugin (configured in `vite.config.js`)
- Theme tokens: `--color-background`, `--color-surface`, `--color-border`, `--color-past`, `--color-future`, `--color-present`
- Font tokens: `--font-heading` (Playfair Display), `--font-ui` (Inter)
- Google Fonts loaded in `index.html`
- Scrollbar hiding for ribbon containers
- Shimmer keyframe animation for image loading state

### Content Package (`packages/content/`)
- `locations.json` — 5 SF locations, 41 total eras
- `index.js` — Helper exports: `locations`, `getLocation(id)`, `getErasForLocation(id)`
- `package.json` — Scoped as `@timeless/content`

**Locations:**
1. **Mission Dolores** (sf-mission) — 9 eras: c.1500, 1776, 1849, 1906, 1945, 1967, 2000, 2025, 2075
2. **The Embarcadero** (sf-embarcadero) — 8 eras: c.1500, 1849, 1906, 1945, 1967, 2000, 2025, 2075
3. **Montgomery Street** (sf-financial) — 8 eras: c.1500, 1849, 1906, 1945, 1967, 2000, 2025, 2075
4. **Chinatown** (sf-chinatown) — 8 eras: c.1500, 1849, 1906, 1945, 1967, 2000, 2025, 2075
5. **Twin Peaks** (sf-twin-peaks) — 8 eras: c.1500, 1849, 1906, 1945, 1967, 2000, 2025, 2075

**Era schema:** `id`, `year_display`, `label`, `era_type` (past/present/future), `image_query`, `headline`, `description`, `key_events[]`, `landscape`, `sources[]`, optional `future_scenarios[]`

**Images:** Currently using `https://picsum.photos/seed/{era_id}/1080/1920` as placeholders. Each era gets a deterministic unique photo via its ID as the seed.

### Config Files
- `AGENTS.md` — Project spec, design system, stack constraints, working style
- `apps/frontend/vite.config.js` — Vite + React + Tailwind v4 plugin
- `apps/frontend/index.html` — Google Fonts preconnect + links

## Design System (from AGENTS.md)
- Background: `#0A0A0A` | Surface: `#141414` | Border: `#222222`
- Past accent: `#C8860A` (amber) | Future accent: `#1E4D8C` (blue) | Present: `#F5F5F5` (white)
- Headings: Playfair Display | UI: Inter
- Mobile frame: max-w-390px centered with border-x

## Commit History
```
19e9689 docs: clean up AGENTS.md trailing artifact
0eb503f fix: image loading with picsum placeholder photos
da565d4 feat: real SF content + location selector
fe0ab6c feat: content package with real SF era data and LocationSelector
2d1b5c4 feat: frontend scaffold v1
69e4735 scaffold frontend with TemporalRibbon and ExperienceWindow
f80dcdb repo skeleton
```

## What's Pending
- **Backend** (`apps/backend/`) — Express + Supabase, not started
- **Real photography** — Currently using picsum placeholders; need curated images per era
- **Location switching within experience** — Currently must go back to selector to change location
- **Era detail view** — Full `key_events`, `landscape`, `sources` data exists in JSON but only headline + 2-sentence description shown in InfoCard
- **Future scenarios UI** — Data exists for 2075 eras with `future_scenarios[]` but no UI to display them
- **Geolocation** — No location-aware features yet (coordinates exist in data)
- **Video support** — AGENTS.md mentions HTML5 video but none implemented
- **Image blur placeholders** — AGENTS.md specifies blur placeholders for lazy loading; shimmer is implemented but not blurhash
- **Responsive/PWA** — Mobile-first layout done but no PWA manifest or service worker
