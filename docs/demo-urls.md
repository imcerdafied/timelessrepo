# Timeless Demo URLs

These paths are the Phunware-facing demo surface for the Atlantis proof case. They are intentionally property-scoped so the same capability can be reused for other hotels, resorts, venues, or destinations by adding another property manifest in `packages/content/properties.json`.

## Primary Demo Paths

| Path | Purpose |
| --- | --- |
| `/` | Demo directory when hosted at `timelessmoment.app`. |
| `/demos` | Demo directory with all current property routes. |
| `/demo/atlantis` | Guest-facing On This Day entry point. |
| `/demo/atlantis/zones` | Atlantis zone and layer explorer. |
| `/demo/atlantis/trails` | Story trails for guided guest journeys. |
| `/demo/atlantis/trail/pirate-nassau/0` | Direct guided Story Trail route with step controls. |
| `/demo/atlantis/passport` | Local passport with collected zone, layer, quest, and share stamps. |
| `/demo/atlantis/timelens/marina-beach-colonial` | Direct TimeLens camera demo. |
| `/demo/atlantis/moment/lobby-royal-towers-modern` | Direct immersive moment demo. |
| `/demo/atlantis/signals` | Behavioral signals dashboard. |

## Platform Model

The Atlantis experience is now selected from a property manifest rather than being hardcoded throughout the app. The active property can be selected by:

- Visiting `/demo/{propertySlug}/...`.
- Setting `VITE_PROPERTY_SLUG` in the frontend environment.
- Setting `PROPERTY_SLUG` in the backend environment.

To add another property, add a new object to `packages/content/properties.json` with its zones, layer IDs, branding, valid content categories, and demo route list.

## Retired Legacy Surface

The original San Francisco dispatch and pre-baked scene prototype are no longer part of the active Phunware demo surface.

- `/api/on-this-day` returns `410` and points to `/api/today-at-property`.
- `/dispatch` returns `410` unless `ENABLE_LEGACY_DISPATCH=true`.
- `/api/scenes/manifest` returns an empty retired manifest unless `ENABLE_LEGACY_SCENES=true`.
