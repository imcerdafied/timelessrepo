# PROGRESS.md — Timeless

Last updated: 2026-02-26
Current commit: `93e9d50` + uncommitted era detail work

## What's Built and Working

### LocationSelector (`apps/frontend/src/components/LocationSelector.jsx`)
Landing screen. Dark background, "Timeless" heading in Playfair Display, subtitle "San Francisco across time". Five staggered-animated cards (Framer Motion, 60ms delay between cards) showing location name, subtext, era count badge, and tagline. Tapping a card calls `setSelectedLocation(id)` which loads that location's eras and transitions to the experience view via AnimatePresence cross-fade.

### ExperienceWindow (`apps/frontend/src/components/ExperienceWindow.jsx`)
Full-bleed background image with Ken Burns zoom (20s cycle, scale 1.0→1.08). Cross-dissolve transitions between eras (600ms AnimatePresence). Dark vignette overlay (radial gradient + 3-stop bottom gradient for InfoCard readability). Era label badge top-left (color-coded pill: amber/white/blue) **+ year display** in monospace next to the pill. InfoCard slides up from bottom with spring easing — glassmorphic card (bg-surface/90, backdrop-blur-xl, shadow-lg) showing headline in Playfair Display and 2-sentence description truncated from full text. **"Tap to explore" affordance** at bottom of InfoCard opens the EraDetail sheet. Shimmer CSS animation while images load. Close button (X, top-right) returns to LocationSelector.

**Image error handling:** `onError` callback catches failed image loads. When an image fails, a subtle era-type-colored gradient replaces it (amber tint for past, neutral for present, blue tint for future) via `eraGradient` map. `imageFailed` state prevents re-rendering the broken `<img>`.

**Key bug fixed (00b5bfb):** `useState` was called after an early `return null`, violating React's Rules of Hooks. The component was silently crashing — images appeared black because the component never rendered. Fixed by moving all hooks above the conditional return and replacing `onAnimationStart` reset with `prevEraId` tracking.

### EraDetail (`apps/frontend/src/components/EraDetail.jsx`) — NEW
Swipe-up bottom sheet that reveals the full content for each era. Triggered by tapping the InfoCard.

**Structure:**
- Backdrop (black/60, click-to-dismiss)
- Spring-animated sheet (stiffness 300, damping 30) slides up from bottom
- Drag-to-dismiss: swipe down >100px offset or >500 velocity closes the sheet
- Drag handle bar at top (8px wide, present/20 color)
- Max height 85vh, scrollable content with overscroll containment

**Content sections:**
1. **Header** — Era type pill (`c. 1500 — Historical Record`), headline in Playfair Display 2xl
2. **Full description** — Complete text (not truncated)
3. **Key Events Timeline** — Vertical timeline with era-colored dots connected by border-colored lines. Year in monospace, event description below each dot.
4. **The Landscape** — Italic prose description of the physical environment
5. **Possible Futures** — Only shown for 2075 eras. Cards with scenario label, sublabel, animated confidence bar (0→N% with spring easing), percentage badge, and description.
6. **Sources** — Small text list of citations

**Styling:** bg-surface/95 backdrop-blur-2xl, border-t border-border, rounded-t-2xl. All section headers are uppercase tracking-wider present/40. Timeline dots and confidence bars use the era accent color.

### TemporalRibbon (`apps/frontend/src/components/TemporalRibbon.jsx`)
Horizontal scrollable row of circular era nodes. Node size 44px, gap 48px. Color-coded by `era_type`: amber (#C8860A) for past, white (#F5F5F5) for present, blue (#1E4D8C) for future. Selected node gets spring-animated glow ring (stiffness 300, damping 25) + dot scale-up (12px→20px). Year labels in monospace (13px) below each node. Auto-centers selected node via native `scrollTo({ behavior: 'smooth' })`. Fade gradients on left/right edges. `whileTap={{ scale: 0.92 }}` for tactile feedback.

### App Shell (`apps/frontend/src/App.jsx`)
Root layout. Outer container: full viewport height, black background, centered. Inner mobile frame: max-w-390px, border-x border-border, bg-background. AnimatePresence switches between LocationSelector (when `selectedLocation` is null) and experience view (ExperienceWindow + TemporalRibbon).

### Zustand Store (`apps/frontend/src/store/useStore.js`)
```
locations        — loaded from packages/content/locations.json at import time
selectedLocation — null | location ID string
setSelectedLocation(id) — sets location, populates eras[], selects first era. null = back to selector
eras             — array of era objects for current location
selectedEra      — current era ID string
setSelectedEra(id) — sets current era
```

### Styling (`apps/frontend/src/index.css`)
Tailwind v4 via `@tailwindcss/vite` plugin. Theme tokens: `--color-background` (#0A0A0A), `--color-surface` (#141414), `--color-border` (#222222), `--color-past` (#C8860A), `--color-future` (#1E4D8C), `--color-present` (#F5F5F5). Font tokens: `--font-heading` (Playfair Display), `--font-ui` (Inter). Google Fonts loaded in `index.html` with preconnect. Scrollbar hiding for overflow-x-auto containers. `@keyframes shimmer` animation for image loading state.

### Content Package (`packages/content/`)
- `locations.json` — 5 SF locations, 41 total eras (Mission has 9, others have 8)
- `index.js` — Exports: `locations`, `getLocation(id)`, `getErasForLocation(id)`
- `package.json` — Scoped `@timeless/content`, ESM

**Locations:**
1. Mission Dolores (sf-mission) — 9 eras: c.1500, 1776, 1849, 1906, 1945, 1967, 2000, 2025, 2075
2. The Embarcadero (sf-embarcadero) — 8 eras: c.1500, 1849, 1906, 1945, 1967, 2000, 2025, 2075
3. Montgomery Street (sf-financial) — 8 eras: c.1500, 1849, 1906, 1945, 1967, 2000, 2025, 2075
4. Chinatown (sf-chinatown) — 8 eras: c.1500, 1849, 1906, 1945, 1967, 2000, 2025, 2075
5. Twin Peaks (sf-twin-peaks) — 8 eras: c.1500, 1849, 1906, 1945, 1967, 2000, 2025, 2075

**Era schema:** `id`, `year_display`, `label`, `era_type` (past/present/future), `image_query`, `headline`, `description`, `key_events[]`, `landscape`, `sources[]`, optional `future_scenarios[]`

## Image Situation
Using `https://picsum.photos/seed/{era.id}/1080/1920` — random photos seeded by era ID so each era gets a unique, deterministic image. Images load and display correctly after the hooks fix. If an image fails to load, a subtle era-colored gradient fallback is shown instead of black. **However, photos are not era-appropriate** (random picsum images, not historical/location photos). The `image_query` field exists in every era's JSON for when we switch to real curated photography.

## Commit History
```
93e9d50 docs: update PROGRESS.md with full session handoff
00b5bfb fix: hooks order crash preventing image rendering
19e9689 docs: clean up AGENTS.md trailing artifact
0eb503f fix: image loading with picsum placeholder photos
da565d4 feat: real SF content + location selector
fe0ab6c feat: content package with real SF era data and LocationSelector
2d1b5c4 feat: frontend scaffold v1
69e4735 scaffold frontend with TemporalRibbon and ExperienceWindow
f80dcdb repo skeleton
```

## What Next Session Should Tackle

### Priority 1: Real Photography
- Source era-appropriate images for all 41 eras
- `image_query` field already exists — could use for search terms
- Consider Wikimedia Commons, LOC, or AI-generated historical imagery

### Priority 2: Backend
- `apps/backend/` — Express + Supabase (not started)
- API to serve location/era data
- Eventually replace static JSON import with API calls

### Priority 3: UX Refinements
- Location switching within experience (currently must go back to selector)
- Geolocation (coordinates exist in data)
- Haptic feedback on ribbon scrub (if PWA)
- Swipe left/right between eras as alternative to ribbon tap

### Lower Priority
- Video support (AGENTS.md mentions it)
- PWA manifest + service worker
- Blurhash placeholders (shimmer is current approach)
