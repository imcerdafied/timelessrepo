# Timeless Moment v2 — Design Spec

## Overview

Five changes to the Phunware hospitality experience layer:

1. **Unique AI-generated era images** — each of the 45 zone × layer combos gets a distinct image
2. **Camera time-travel** — point camera at a scene, AI generates what it looked like in another era
3. **Era selfie** — take a selfie composited into any era
4. **On This Day (simplified)** — remove daily schedule/weather, keep only historical events + did-you-know
5. **Light theme** — flip from dark to clean Apple-style white

## 1. Unique Era Images

### Image Generation Script

Create `scripts/generate-images.js` that calls OpenAI's gpt-image-1 API to generate one image per era entry.

**Input:** Read `packages/content/locations.json` for zone/layer metadata.

**Per-image prompt construction:**
```
A photorealistic scene of [zone.name] at [era.label] ([era.year_display]).
[era.landscape]
Style: editorial travel photography, golden hour lighting, 16:9 landscape format.
No text, no watermarks, no people unless the era description calls for crowds.
```

**Output:** Upload each generated image to Supabase Storage bucket `era-images` as `{era-id}.webp`. Update `apps/frontend/src/data/imageMap.js` with the new URLs.

**Usage:** `OPENAI_API_KEY=... node scripts/generate-images.js [zone-id]`
- Single zone mode for testing quality
- Full mode generates all 45
- 1-second delay between calls
- Skip eras that already have a non-Unsplash URL in the image map

**Fallback chain (unchanged):** Generated image → Unsplash placeholder → gradient

### imageMap.js Updates

Replace Unsplash placeholder URLs with Supabase-hosted generated image URLs:
```js
const CURATED = {
  'marina-beach-deep-past': 'https://{SUPABASE_URL}/storage/v1/object/public/era-images/marina-beach-deep-past.webp',
  // ... 44 more
}
```

## 2. Camera Time-Travel

### User Flow

1. Guest is viewing any layer in ExperienceWindow
2. Taps camera icon (already exists in top-right controls)
3. Rear camera opens fullscreen (reuse existing CameraOverlay pattern)
4. Guest frames a scene, taps "Capture" button
5. Loading state: "Traveling through time..." with shimmer animation
6. AI-generated result appears showing the scene transformed to the selected era
7. Guest can:
   - **Save** — downloads the image to camera roll
   - **Share** — uses Web Share API (existing ShareCard pattern)
   - **Try another era** — ribbon at bottom lets them pick a different layer
   - **Close** — returns to ExperienceWindow

### Frontend Component: `CameraTimeTravel.jsx`

Replaces/extends the existing `CameraOverlay.jsx`.

**States:**
- `camera` — live camera feed, capture button
- `processing` — shimmer loading, "Traveling to [era.label]..."
- `result` — generated image with save/share/retry controls

**Camera capture:**
```js
const canvas = document.createElement('canvas')
canvas.width = video.videoWidth
canvas.height = video.videoHeight
canvas.getContext('2d').drawImage(video, 0, 0)
const base64 = canvas.toDataURL('image/jpeg', 0.85)
```

**API call:**
```js
const response = await fetch('/api/camera/time-travel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image: base64,
    zone_id: selectedLocation,
    era_id: selectedEra,
    era_label: era.label,
    era_year: era.year_display,
    era_description: era.description,
    era_landscape: era.landscape,
  })
})
const { generated_image } = await response.json()
```

**Result display:**
- Full-screen generated image with Ken Burns animation
- Era label + year overlay top-left
- "AI-generated time travel" subtle caption bottom
- Save / Share / Close buttons

### Backend Route: `POST /api/camera/time-travel`

New file: `apps/backend/src/routes/camera.js`

```js
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

router.post('/time-travel', async (req, res) => {
  const { image, zone_id, era_id, era_label, era_year, era_description, era_landscape } = req.body

  // Validate
  if (!image || !era_id) return res.status(400).json({ error: 'Missing required fields' })

  // Strip data URL prefix if present
  const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

  const prompt = `Transform this photograph to show what this exact location looked like during the ${era_label} era (${era_year}).

Scene context: ${era_landscape}

Historical context: ${era_description.slice(0, 500)}

CRITICAL: Maintain the same camera angle, framing, and composition as the input photo. Transform the buildings, vegetation, people, and atmosphere to match the historical period. Photorealistic style, editorial travel photography quality.`

  const response = await client.images.edit({
    model: 'gpt-image-1',
    image: Buffer.from(base64Data, 'base64'),
    prompt,
    size: '1024x1024',
  })

  const generatedImageUrl = response.data[0]?.url || response.data[0]?.b64_json
  res.json({ generated_image: generatedImageUrl })
})
```

**Rate limiting:** Apply the existing `apiLimiter` (20 req/min) to this route. Image generation is expensive — consider a tighter limit (5 req/min) for camera routes specifically.

**Error handling:** If OpenAI fails, return a graceful error and the frontend shows "Time travel temporarily unavailable" with option to retry.

## 3. Era Selfie

### User Flow

1. Guest taps a selfie icon (new button in ExperienceWindow controls or in the camera view)
2. Front camera opens
3. Guest takes a selfie
4. Loading state: "Placing you in [era.label]..."
5. AI-generated result shows the guest composited into the era scene
6. Same save/share/close controls as time-travel

### Frontend: Add selfie mode to `CameraTimeTravel.jsx`

Same component, different mode. Props: `mode="time-travel" | "selfie"`

**Selfie mode differences:**
- Uses front camera (`facingMode: 'user'`)
- Different loading text: "Placing you in [era]..."
- Different result caption: "You in [zone], [era.year_display]"

### Backend Route: `POST /api/camera/selfie`

Same route file (`camera.js`).

```js
router.post('/selfie', async (req, res) => {
  const { image, zone_id, era_id, era_label, era_year, era_description, era_landscape } = req.body

  if (!image || !era_id) return res.status(400).json({ error: 'Missing required fields' })

  const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

  const prompt = `Place this person into a scene at ${era_label} (${era_year}).

Scene: ${era_landscape}

The person should appear naturally in the scene as if they are visiting this place during this time period. Maintain their exact likeness, facial features, and expression. Dress them in period-appropriate clothing if possible. The scene should be photorealistic, editorial travel photography quality. The person should be the clear subject, roughly centered, with the historical scene as their environment.`

  const response = await client.images.edit({
    model: 'gpt-image-1',
    image: Buffer.from(base64Data, 'base64'),
    prompt,
    size: '1024x1024',
  })

  const generatedImageUrl = response.data[0]?.url || response.data[0]?.b64_json
  res.json({ generated_image: generatedImageUrl })
})
```

## 4. On This Day (Simplified)

### What to Remove

From `TodayAtAtlantis.jsx`:
- Weather bar (temp, condition, water temp, sunset)
- Today's Events section (shark feeding, sunset cruise, chef's table)
- The static fallback weather/events data

From `apps/backend/src/routes/today-at-property.js`:
- Weather generation in the Claude prompt
- Events generation in the Claude prompt
- Weather/events in the static fallback

### What to Keep

- **Header** with property name and logo (triple-tap for admin)
- **2-3 "On This Day" historical events** — AI-generated daily, each linked to a zone/layer. "On April 5, 1718, Woodes Rogers departed Bristol with orders to end the Republic of Pirates..."
- **"Did You Know" fact** — one interesting fact about the resort, marine life, or the Bahamas
- **"Explore All Zones" button** at the bottom

### Updated API Response Shape

```json
{
  "greeting": "On This Day at Atlantis",
  "events": [
    {
      "year": "1718",
      "headline": "The End of the Pirate Republic",
      "snippet": "Woodes Rogers departed Bristol with Royal authority to end piracy in Nassau...",
      "zone_id": "marina-beach",
      "layer_id": "marina-beach-colonial"
    }
  ],
  "did_you_know": "The Bahamas has the third-largest barrier reef system in the world..."
}
```

### Updated Static Fallback

Same shape but without weather/events. Three hardcoded historical events and a did-you-know fact.

## 5. Light Theme

### Design Tokens

Update `apps/frontend/src/index.css` `@theme` block:

```css
@theme {
  --color-background: #FFFFFF;
  --color-surface: #F5F5F5;
  --color-border: #E5E5E5;
  --color-past: #C8860A;
  --color-future: #1E4D8C;
  --color-present: #1A1A1A;
  --color-cultural: #2D8F4E;
  --color-operational: #4A90A4;
  --color-primary: #0B3D5C;
  --color-accent: #D4845A;

  --font-heading: "Playfair Display", serif;
  --font-ui: "Inter", sans-serif;
}
```

**Key changes:**
- `background`: `#0A0A0A` → `#FFFFFF`
- `surface`: `#141414` → `#F5F5F5`
- `border`: `#222222` → `#E5E5E5`
- `present` (text color): `#F5F5F5` → `#1A1A1A`
- `accent`: `#E8A87C` → `#D4845A` (slightly darker for contrast on white)

### Body Styles

```css
body {
  background-color: var(--color-background);
  color: var(--color-present);
  /* rest unchanged */
}
```

### Component-Level Adjustments

Most components use Tailwind semantic classes (`bg-background`, `text-present`, `border-border`) so they'll flip automatically. Specific fixes needed:

**App.jsx outer container:**
- `bg-black` → `bg-white` (the centering wrapper)

**ExperienceWindow.jsx:**
- Keep dark overlays on images (gradient overlays, era label backgrounds). The image-forward view needs dark text backgrounds regardless of theme.
- Bottom sheet content area: `bg-background` will now be white — this is correct, content reads well on white.

**LocationSelector / ZoneSelector:**
- Cards: `bg-surface` → now light gray, `border-border` → now light border. Clean Apple look.
- Text: `text-present` → now dark. `text-present/50` → now dark at 50% opacity. Works well on white.

**Onboarding:**
- `bg-background` → now white. Text contrasts fine.

**AdminDashboard:**
- Same semantic classes, auto-flips. Bar charts and pills use accent colors that work on both.

**SplashScreen:**
- `bg-background` → white. "ATLANTIS EXPERIENCE" text in dark. Tagline in accent. Clean.

**TemporalRibbon:**
- `bg-background` → white. Fade edges update automatically via `from-background`. Node colors (amber, blue, green, teal) pop against white.

**CharacterChat:**
- Chat bubbles need attention: assistant messages on light gray, user messages on primary/accent. The "Powered by Phunware AI" watermark text needs darker opacity.

**ShareCard:**
- The rendered share card (for saving/sharing) should KEEP a dark aesthetic — it's a branded artifact, not a UI screen. Only the app chrome goes light.

**Shimmer animation:**
- Update from dark shimmer to light shimmer:
```css
.shimmer {
  background: linear-gradient(90deg, #F5F5F5 25%, #EBEBEB 50%, #F5F5F5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}
```

**Audio pulse:**
- Update glow color to work on light background.

**mobile-frame:**
- No change needed — it's just positioning.

### Opacity Adjustments

The current design uses `text-present/50`, `text-present/40`, `text-present/30` etc. for secondary text. Since `present` flips from white to dark, these percentages should mostly work — dark text at 50% opacity on white is readable. However, some very low opacities (`/15`, `/20`) that were subtle on dark may be invisible on white. These need bumping:

- `text-present/15` → `text-present/30` (watermarks, very subtle text)
- `text-present/20` → `text-present/30`
- `text-present/25` → `text-present/35`

## Environment Variables

**New:**
- `OPENAI_API_KEY` — OpenAI API key for image generation (gpt-image-1)

**New dependency:**
- `openai` npm package in `apps/backend/`

## Files Changed Summary

### New Files
- `scripts/generate-images.js` — AI image generation script
- `apps/frontend/src/components/CameraTimeTravel.jsx` — camera time-travel + selfie component
- `apps/backend/src/routes/camera.js` — image generation API routes

### Modified Files
- `apps/frontend/src/index.css` — light theme tokens + shimmer
- `apps/frontend/src/App.jsx` — outer bg-black → bg-white
- `apps/frontend/src/data/imageMap.js` — generated image URLs
- `apps/frontend/src/components/ExperienceWindow.jsx` — camera/selfie buttons, dark overlay adjustments
- `apps/frontend/src/components/TodayAtAtlantis.jsx` — remove weather/events, keep On This Day + did-you-know
- `apps/frontend/src/components/CharacterChat.jsx` — chat bubble colors for light theme
- `apps/frontend/src/components/LocationSelector.jsx` — opacity adjustments
- `apps/frontend/src/components/Onboarding.jsx` — opacity adjustments
- `apps/frontend/src/components/AdminDashboard.jsx` — opacity adjustments
- `apps/frontend/src/components/SplashScreen.jsx` — text color adjustments
- `apps/backend/server.js` — register camera routes, add openai dependency
- `apps/backend/src/routes/today-at-property.js` — simplify to On This Day only
- `apps/backend/package.json` — add openai dependency
