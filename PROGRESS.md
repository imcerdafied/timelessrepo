# PROGRESS.md — Timeless

Last updated: 2026-02-28
Current commit: `a6a1f73`

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

### ExperienceWindow (`apps/frontend/src/components/ExperienceWindow.jsx`)
Image-first layout: era image fills full screen edge-to-edge with Ken Burns zoom (20s, 1.0→1.08) and gyroscope parallax (±8px shift via `useGyroscope` hook). Bottom gradient overlay (transparent top, dark bottom 40%). Era label + year top-left, control buttons (share, camera, close) top-right. Artifact count pill floats above bottom sheet. Bottom sheet peeks from bottom showing headline + first sentence (~30% screen); drag/tap to expand with full description + key events. "Full detail" opens EraDetail sheet. For future eras, expanded sheet shows FutureVoting component instead of key events. Cross-dissolve transitions between eras (600ms).

### FutureVoting (`apps/frontend/src/components/FutureVoting.jsx`)
Renders for `era_type === 'future'` eras only. Shows scenario cards from `era.future_scenarios` with live vote percentage bars (amber fill, animated), vote counts, truncated descriptions, and vote buttons. One vote per device per era via `device_id` in localStorage (UUID). Votes upserted to `future_votes` table with `ON CONFLICT` for vote changing. Pledge section: "I will..." text input with name, submits to `pledges` table, shows recent pledges. Voices feed: most recent votes with messages. All data via Supabase frontend client.

### ShareCard (`apps/frontend/src/components/ShareCard.jsx`)
Shareable era card (390x690px portrait). Full era image background, dark gradient overlay bottom 60%, "TIMELESS MOMENT" branding top, large year center, location name + headline + description snippet bottom, amber rule + "A place in time." footer. Uses `html2canvas` for 2x capture. Web Share API on mobile (shares PNG file + URL), falls back to PNG download on desktop. Share button in ExperienceWindow top-right controls.

### Onboarding (`apps/frontend/src/components/Onboarding.jsx`)
Three-screen first-run overlay (z-50, above everything). Screen 1: "Every place has a past." — introduces the concept. Screen 2: "Scrub through time." — interactive temporal ribbon preview with tappable era dots. Screen 3: "Leave your mark." — describes artifact/voting features, amber "Begin" button completes onboarding. Dot indicators, swipeable via tap. Tracked in `localStorage: onboarding_complete`. Shows after splash, before app flow.

### LocationSelector (`apps/frontend/src/components/LocationSelector.jsx`)
City-grouped landing screen. Amber tab pills at top select city (San Francisco, New York, London, Riyadh, Los Angeles, Chicago, Lagos). Location cards show name (Playfair Display), subtext, tagline (2-line clamp), era count, and year range. AnimatePresence cross-fades between city groups. Staggered card entrance animations.

### GPSTrigger (`apps/frontend/src/components/GPSTrigger.jsx`)
Auto-requests geolocation on mount. Uses Haversine formula to find nearest location. Within 500m: amber "You are here" card with "Explore This Place" CTA. Further: shows nearest location with distance and "Go There" option. Permission denied: silent fail. Exports `useGPS()` hook for shared GPS state. Wired into App.jsx above LocationSelector.

### CameraOverlay (`apps/frontend/src/components/CameraOverlay.jsx`)
Full-screen rear camera feed via `getUserMedia({ facingMode: 'environment' })`. Historical era image overlaid with CSS opacity and gyroscope parallax. Draggable pointer-event slider: left = live camera, right = historical era image. Era selector pill row at top to switch between eras. Shows era headline, year, label. X button to close.

### ArtifactLayer (`apps/frontend/src/components/ArtifactLayer.jsx`)
"I Was Here" presence layer. Queries Supabase directly. Count pill: "47 people stood here in 1906" or "Be the first". Bottom sheet with drag handle, X close button, back arrow in form view. Visitor list, "I WAS HERE" button opens form (name, message, emoji picker). Success state with checkmark, auto-returns to list after 1.5s. Safe-area-aware padding for mobile.

### Supabase (live)
Frontend connects directly via `apps/frontend/src/lib/supabase.js` using `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Tables: `artifacts` (presence layer), `future_votes` (scenario voting), `future_vote_tallies` (aggregated view), `pledges` (future action pledges). RLS policies enforce public SELECT and validated INSERT.

### Backend API (`apps/backend/`)
Express server with two routes (retained for admin/future use):
- `GET /api/artifacts/:locationId/:eraId` — returns count and 20 most recent artifacts
- `POST /api/artifacts` — validates and inserts, returns id + share_token

Backend Supabase client in `apps/backend/src/lib/supabase.js` uses `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (service role for admin ops). Schema in `apps/backend/schema.sql`.

### EraDetail (`apps/frontend/src/components/EraDetail.jsx`)
Swipe-up bottom sheet: header with era type pill, headline, full description, key events timeline, landscape description, future scenarios with animated confidence bars, sources.

### TemporalRibbon (`apps/frontend/src/components/TemporalRibbon.jsx`)
Horizontal scrollable row of circular era nodes. Color-coded by era_type. Spring-animated selection glow. Year labels below. Auto-centers selected node.

### SplashScreen (`apps/frontend/src/components/SplashScreen.jsx`)
Full-screen "TIMELESS MOMENT" splash with tagline "A place in time." Staggered fade-in, cross-fade out after 2.5s.

### App Shell (`apps/frontend/src/App.jsx`)
Root layout with mobile frame (max-w-390px). Flow: SplashScreen → Onboarding (first run) → GPSTrigger + LocationSelector → ExperienceWindow + TemporalRibbon. GPS dismissed on browse or location select.

### Hooks
- **useEraImage** (`hooks/useEraImage.js`): Three-tier image resolution: curated Wikimedia Commons (45 entries) → Unsplash API → Picsum seed fallback. Returns `{ url, credit, creditUrl }`.
- **useGyroscope** (`hooks/useGyroscope.js`): Device orientation parallax. iOS permission via user gesture + localStorage. Desktop mouse fallback. Returns `{ tilt, supported, needsPermission, requestPermission }`.

### Store (`apps/frontend/src/store/useStore.js`)
Zustand: locations, selectedLocation, setSelectedLocation, eras, selectedEra, setSelectedEra.

### Styling (`apps/frontend/src/index.css`)
Tailwind v4. Theme: background #0A0A0A, surface #141414, border #222222, past #C8860A, future #1E4D8C, present #F5F5F5. Fonts: Playfair Display + Inter.

### Config
- Vite proxy: `/api` → `http://localhost:3001` for local dev
- PostHog analytics integrated
- Image fallback chain: curated → Unsplash API → Picsum → gradient

## Supabase Tables Required

The following tables must exist in Supabase for all features to work:

```sql
-- artifacts (already deployed)
-- See apps/backend/schema.sql

-- future_votes
CREATE TABLE IF NOT EXISTS future_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  era_id TEXT NOT NULL,
  scenario_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  message TEXT,
  UNIQUE(era_id, device_id)
);
ALTER TABLE future_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "future_votes_select" ON future_votes FOR SELECT USING (true);
CREATE POLICY "future_votes_insert" ON future_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "future_votes_update" ON future_votes FOR UPDATE USING (true);

-- future_vote_tallies (view)
CREATE OR REPLACE VIEW future_vote_tallies AS
SELECT era_id, scenario_id, COUNT(*) as vote_count
FROM future_votes
GROUP BY era_id, scenario_id;

-- pledges
CREATE TABLE IF NOT EXISTS pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  era_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  pledge_text TEXT NOT NULL
);
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pledges_select" ON pledges FOR SELECT USING (true);
CREATE POLICY "pledges_insert" ON pledges FOR INSERT WITH CHECK (length(pledge_text) <= 200);
```

## Environment Variables
**Frontend (VITE_ prefix):**
- `VITE_POSTHOG_KEY` — PostHog analytics
- `VITE_API_URL` — Backend API base URL (empty = same origin)
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key
- `VITE_UNSPLASH_ACCESS_KEY` — Unsplash API key (get at unsplash.com/developers). Optional; without it, non-curated eras use Picsum.

**Backend:**
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — Supabase service role key
- `PORT` — Server port (default 3001)

## What Next Session Should Tackle

### Priority 1: Deploy Supabase Tables
- Run the SQL above in Supabase SQL editor to create `future_votes`, `future_vote_tallies`, and `pledges` tables
- FutureVoting and pledge features will silently fail until tables exist

### Priority 2: Unsplash Key + More Curated Images
- Add `VITE_UNSPLASH_ACCESS_KEY` to Railway env vars (get free key at unsplash.com/developers)
- 45 eras have curated Wikimedia images; Unsplash covers the rest when key is set
- Key gaps for manual curation: pre-photography eras (c.1500), future (2075)
- AI-generated images for Alamo eras: see `docs/alamo-image-prompts.md`
- CURATED map in `useEraImage.js` is easy to extend — just add era-id → URL entries

### Priority 3: Lower Priority
- Haptic feedback on ribbon scrub (if PWA)
- Swipe left/right between eras
- Location switching within experience
- PWA manifest + service worker
- Video support
- Location search/filter
- Offline mode
