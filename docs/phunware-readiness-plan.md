# Phunware Readiness Plan

## Current Assessment

Timeless is now in credible demo shape for an Atlantis-focused Phunware review, but it should still be treated as a production-grade prototype rather than a fully productionized platform. The core experience direction matches the proposal: On This Day, TimeLens, immersive moments, and behavioral signals are present enough to demonstrate the IP clearly.

The highest-value change made in this pass is platform framing. Atlantis is now configured as a property in `packages/content/properties.json`, and the main demo paths are property-scoped. That lets Phunware see the capability as reusable hospitality infrastructure instead of a one-off Atlantis build.

## What Is Ready To Show

- Clean property-scoped demo URLs for Atlantis.
- On This Day entry point at `/demo/atlantis`.
- Zone explorer at `/demo/atlantis/zones`.
- Direct TimeLens path at `/demo/atlantis/timelens/marina-beach-colonial`.
- Direct immersive moment path at `/demo/atlantis/moment/lobby-royal-towers-modern`.
- Behavioral signals dashboard path at `/demo/atlantis/signals`.
- Frontend production build passes.
- Frontend lint exits with zero errors.
- Supabase is optional for browse-only demos, so the app can load without local database keys.

## Remaining Gaps Before Calling It Client-Ready

| Area | Current State | Needed Next |
| --- | --- | --- |
| Platform configuration | Property manifest exists for Atlantis. | Add manifest validation, per-property assets, and one second sample property to prove portability. |
| TimeLens | Direct route opens the camera/time-travel surface. | Add branded QR/deep-link share cards and graceful no-camera fallback for desktop demos. |
| On This Day | Property-aware API and frontend route exist. | Add content caching, editorial override content, and deterministic demo fixtures. |
| Behavioral graph | Dashboard exists as demo surface. | Add durable event ingestion API, FunID/user binding, and exportable event taxonomy for Phunware. |
| Admin/readiness | Demo controls exist. | Separate guest/demo/admin modes and protect admin surfaces for deployed environments. |
| Quality | Build passes and lint has no errors. | Add e2e smoke tests for every demo URL, unit tests for route/property selection, and CI. |
| Performance | Build works, but main JS chunk is large. | Code-split AI scenes, admin dashboard, and heavy capture/share tooling. |
| Security | API rate limits exist for expensive endpoints. | Complete env validation, production CORS allowlist, auth for dashboard, and secret scanning. |

## Recommended Push To "Pretty Ready"

1. Demo polish sprint
   - Add Playwright smoke tests for `/demos`, `/demo/atlantis`, `/demo/atlantis/zones`, `/demo/atlantis/timelens/marina-beach-colonial`, `/demo/atlantis/moment/lobby-royal-towers-modern`, and `/demo/atlantis/signals`.
   - Add a desktop fallback for TimeLens that uses a sample Atlantis image if camera permission is denied.
   - Add generated/branded share cards with QR/deep links.

2. Platform proof sprint
   - Add a second sample property manifest with placeholder zones and layers.
   - Introduce a manifest schema check so bad property configs fail early.
   - Move remaining display strings that say Atlantis into the property manifest where appropriate.

3. Phunware integration sprint
   - Define the behavioral event taxonomy: zone entered, layer viewed, TimeLens opened, share generated, offer intent, AI character interaction, future vote, dwell threshold.
   - Create a backend event ingestion endpoint that can later bind to FunID or Phunware identity.
   - Produce a short implementation map showing how the demo surfaces fit into a Phunware guest app.

4. Production hardening sprint
   - Add CI for install, build, lint, and e2e smoke.
   - Split large bundles and lazy-load admin/AI-heavy modules.
   - Add deployed environment docs and a locked production CORS policy.

## Retired Prototype Surface

The San Francisco dispatch and 1906 scene prototype are no longer active demo surfaces. They remain in the repository as legacy reference material, but they are hidden behind explicit flags:

- `ENABLE_LEGACY_DISPATCH=true`
- `ENABLE_LEGACY_SCENES=true`

For Phunware review, keep both flags disabled.
