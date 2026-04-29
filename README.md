# Timeless Moment

Timeless Moment is a property-scoped experience intelligence prototype: On This Day content, TimeLens camera storytelling, immersive moments, and behavioral signal capture for venues and destinations. The current proof case is Atlantis Paradise Island for a Phunware hospitality demo.

## Demo URLs

Run the frontend locally and use these paths:

- `/demos`
- `/`
- `/demo/atlantis`
- `/demo/atlantis/zones`
- `/demo/atlantis/trails`
- `/demo/atlantis/passport`
- `/demo/atlantis/timelens/marina-beach-colonial`
- `/demo/atlantis/moment/lobby-royal-towers-modern`
- `/demo/atlantis/signals`

See `docs/demo-urls.md` for the full route map and platform notes.

## Local Development

```bash
cd apps/frontend
npm install
npm run dev
```

In another terminal:

```bash
cd apps/backend
npm install
npm run dev
```

Copy `.env.example` into the environment files used by your host or shell. The frontend will run without Supabase keys for demo browsing; database-backed artifact and voting writes require Supabase configuration.

## Property Configuration

Reusable property configuration lives in `packages/content/properties.json`. Add a new property manifest to reuse the same demo surfaces for another resort, hotel, venue, or destination.
