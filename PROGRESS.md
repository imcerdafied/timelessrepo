# PROGRESS.md — Timeless

Last updated: 2026-02-27
Current commit: `3b1b93e`

## What's Built and Working

### Content — 21 Locations, 7 Cities (`apps/frontend/src/data/locations.json`)
189 total eras across 21 locations. Each location has exactly 9 eras with full content: description, key_events, landscape, sources, and future_scenarios for 2075 eras.

**San Francisco (8):** Mission Dolores, The Embarcadero, Montgomery Street, Chinatown, Twin Peaks, Haight-Ashbury, North Beach, Alamo
**New York (3):** Lower Manhattan, Brooklyn Bridge, Harlem
**London (2):** South Bank, City of London
**Riyadh (2):** Diriyah, The Empty Quarter
**Los Angeles (2):** Downtown, Venice Beach
**Chicago (2):** The Loop, South Side
**Lagos (2):** Lagos Island, Victoria Island

Each location has: id, name, city, subtext, coordinates, tagline, eras[]. Era schema: id, year_display, label, era_type (past/present/future), image_query, headline, description, key_events[], landscape, sources[], optional future_scenarios[].

### LocationSelector (`apps/frontend/src/components/LocationSelector.jsx`)
City-grouped landing screen. Amber tab pills at top select city (San Francisco, New York, London, Riyadh, Los Angeles, Chicago, Lagos). Location cards show name (Playfair Display), subtext, tagline (2-line clamp), era count, and year range. AnimatePresence cross-fades between city groups. Staggered card entrance animations.

### GPSTrigger (`apps/frontend/src/components/GPSTrigger.jsx`)
Auto-requests geolocation on mount. Uses Haversine formula to find nearest location. Within 500m: amber "You are here" card with "Explore This Place" CTA. Further: shows nearest location with distance and "Go There" option. Permission denied: silent fail. Exports `useGPS()` hook for shared GPS state. Wired into App.jsx above LocationSelector.

### CameraOverlay (`apps/frontend/src/components/CameraOverlay.jsx`)
Full-screen rear camera feed via `getUserMedia({ facingMode: 'environment' })`. Historical era image overlaid with CSS opacity. Draggable pointer-event slider: left = live camera, right = historical era image. Era selector pill row at top to switch between eras. Shows era headline, year, label. X button to close. Wired into ExperienceWindow via camera icon button in top-right controls.

### ArtifactLayer (`apps/frontend/src/components/ArtifactLayer.jsx`)
"I Was Here" presence layer. Count pill at bottom of era view: "47 people stood here in 1906" or "Be the first". Tapping opens bottom sheet (spring-animated, drag-to-dismiss). Sheet shows: recent visitor entries (name + emoji + message + time ago) + "I WAS HERE" button. Drop form: name input, optional message (200 char), 8-emoji picker, submit. On success: brief amber success state. Uses GPS coords from `useGPS()` hook if available.

### Backend API (`apps/backend/`)
Express server with two routes:
- `GET /api/artifacts/:locationId/:eraId` — returns count and 20 most recent artifacts
- `POST /api/artifacts` — validates and inserts, returns id + share_token

Supabase schema in `apps/backend/schema.sql`. Requires SUPABASE_URL and SUPABASE_SERVICE_KEY env vars. Gracefully degrades when Supabase is not configured.

### ExperienceWindow (`apps/frontend/src/components/ExperienceWindow.jsx`)
Full-bleed background image with Ken Burns zoom (20s cycle, scale 1.0→1.08). Cross-dissolve transitions between eras (600ms). Dark vignette overlay. Era label badge top-left. InfoCard slides up from bottom. Camera icon + close button top-right. ArtifactLayer count pill above InfoCard. EraDetail sheet on tap. CameraOverlay on camera button tap.

### EraDetail (`apps/frontend/src/components/EraDetail.jsx`)
Swipe-up bottom sheet: header with era type pill, headline, full description, key events timeline, landscape description, future scenarios with animated confidence bars, sources.

### TemporalRibbon (`apps/frontend/src/components/TemporalRibbon.jsx`)
Horizontal scrollable row of circular era nodes. Color-coded by era_type. Spring-animated selection glow. Year labels below. Auto-centers selected node.

### SplashScreen (`apps/frontend/src/components/SplashScreen.jsx`)
Full-screen "TIMELESS MOMENT" splash. Staggered fade-in, cross-fade out after 2.5s.

### App Shell (`apps/frontend/src/App.jsx`)
Root layout with mobile frame (max-w-390px). AnimatePresence: SplashScreen → GPSTrigger + LocationSelector → ExperienceWindow + TemporalRibbon. GPS dismissed on browse or location select.

### Store (`apps/frontend/src/store/useStore.js`)
Zustand: locations, selectedLocation, setSelectedLocation, eras, selectedEra, setSelectedEra.

### Styling (`apps/frontend/src/index.css`)
Tailwind v4. Theme: background #0A0A0A, surface #141414, border #222222, past #C8860A, future #1E4D8C, present #F5F5F5. Fonts: Playfair Display + Inter.

### Config
- Vite proxy: `/api` → `http://localhost:3001` for local dev
- PostHog analytics integrated
- Curated Wikimedia Commons images for 38 eras (27 unique images), Picsum fallback for rest
- Automatic fallback: curated URL fails → Picsum → gradient

## Commit History
```
4439801 feat: add Alamo location (21 total)
76dcde4 feat: presence layer complete — GPS, camera, artifacts
3b1b93e feat: I Was Here artifact layer
5eca714 feat: camera then/now overlay
ac03356 feat: GPS location trigger
19fed83 feat: city-grouped LocationSelector
ccb0c9e feat: 20 locations across 7 cities
3593443 fix: move PostHog key to environment variable
97c0aaa chore: add PostHog API key
672cba2 feat: PostHog analytics
7334d7d docs: update PROGRESS.md with session handoff
a6f1071 fix: picsum seed images, reliable loading
e563c97 fix: keyword-based era images
a6f0890 feat: real curated Unsplash photos per era
e12b4bf fix: splash centering + reliable image loading
f43e66a chore: rename app to Timeless Moment
8b10e6b feat: curated era images + splash screen
31ffc62 fix: images and touch gestures for mobile
de784ec fix: EraDetail scroll cutoff + safe area padding
761d971 fix: use serve package for Railway static hosting
2542daa fix: allow Railway host in Vite preview config
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

## Environment Variables
**Frontend (VITE_ prefix):**
- `VITE_POSTHOG_KEY` — PostHog analytics
- `VITE_API_URL` — Backend API base URL (empty = same origin)
- `VITE_SUPABASE_URL` — (for future direct Supabase access)
- `VITE_SUPABASE_ANON_KEY` — (for future direct Supabase access)

**Backend:**
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — Supabase service role key
- `PORT` — Server port (default 3001)

## Supabase Setup Required
Run `apps/backend/schema.sql` in the Supabase SQL editor to create the `artifacts` table with RLS policies.

## What Next Session Should Tackle

### Priority 1: More Real Photography
- 38 eras now have curated Wikimedia Commons images (20% coverage)
- Remaining ~150 eras still use Picsum seed fallback
- Key gaps: present-day (2025) eras, future (2075) eras, pre-photography eras (c.1500)
- Consider: Unsplash API for present-day, AI-generated for pre-photography/future
- `image_query` field exists in every era's JSON for sourcing hints
- `imageMap.js` CURATED map is easy to extend — just add era-id → URL entries

### Priority 2: Backend Deployment
- Backend needs to be deployed (Railway or separate service)
- Set SUPABASE_URL and SUPABASE_SERVICE_KEY in Railway
- Run schema.sql in Supabase dashboard
- Set VITE_API_URL in frontend env if backend is on a different domain

### Priority 3: UX Refinements
- Haptic feedback on ribbon scrub (if PWA)
- Swipe left/right between eras
- Location switching within experience
- PWA manifest + service worker

### Lower Priority
- Video support
- Share artifact via share_token URL
- Location search/filter
- Offline mode
