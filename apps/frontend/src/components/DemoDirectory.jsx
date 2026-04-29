import { ACTIVE_PROPERTY } from '../config/properties'

const routeVisuals = {
  'Guest Demo': {
    kicker: 'Guest entry',
    value: 'On This Day',
    className: 'border-primary/25 bg-primary/[0.06]',
  },
  'Guided Trail': {
    kicker: 'Recommended',
    value: '3 stops',
    className: 'border-accent/35 bg-accent/[0.10]',
  },
  'Story Trails': {
    kicker: 'Journey layer',
    value: '4 trails',
    className: 'border-cultural/25 bg-cultural/[0.06]',
  },
  Passport: {
    kicker: 'Progress',
    value: 'Stamps',
    className: 'border-past/25 bg-past/[0.07]',
  },
  TimeLens: {
    kicker: 'Camera',
    value: 'Selfie',
    className: 'border-future/25 bg-future/[0.07]',
  },
  'Behavioral Signals': {
    kicker: 'Apollo',
    value: 'Signals',
    className: 'border-operational/25 bg-operational/[0.08]',
  },
}

function routeTone(route) {
  return routeVisuals[route.label] || {
    kicker: 'Module',
    value: 'Open',
    className: 'border-border bg-surface',
  }
}

export default function DemoDirectory() {
  const featuredRoute = ACTIVE_PROPERTY.demoRoutes.find((route) => route.label === 'Guided Trail')
  const routes = ACTIVE_PROPERTY.demoRoutes.filter((route) => route.path !== featuredRoute?.path)

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-border bg-[#081017] px-5 pb-5 pt-8 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-ui text-[10px] tracking-[0.22em] text-accent uppercase">
              Timeless Moment
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight">
              {ACTIVE_PROPERTY.brandName}
            </h1>
            <p className="mt-2 font-ui text-sm leading-relaxed text-white/58">
              Phunware-ready experience intelligence for hospitality, story, place, and guest signal.
            </p>
          </div>
          <div className="shrink-0 rounded-full border border-accent/35 px-3 py-1.5 font-mono text-[10px] text-accent">
            Live Demo
          </div>
        </div>

        {featuredRoute && (
          <a
            href={featuredRoute.path}
            className="mt-5 block rounded-lg border border-accent/45 bg-accent/15 p-4 transition-colors hover:bg-accent/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-ui text-[10px] tracking-[0.18em] text-accent uppercase">
                  Start here
                </div>
                <div className="mt-1 font-heading text-xl font-semibold text-white">
                  Pirate Nassau guided trail
                </div>
                <p className="mt-1 font-ui text-xs leading-relaxed text-white/62">
                  A complete click-through of trail guidance, character chat, and Passport completion.
                </p>
              </div>
              <span className="rounded-full bg-accent px-3 py-1.5 font-ui text-xs font-semibold text-background">
                Open
              </span>
            </div>
          </a>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-5">
        <div className="flex items-center justify-between">
          <p className="font-ui text-[10px] tracking-[0.18em] text-present/42 uppercase">
            Demo surfaces
          </p>
          <span className="font-mono text-[10px] text-present/35">
            {routes.length + (featuredRoute ? 1 : 0)} routes
          </span>
        </div>

        {routes.map((route) => {
          const tone = routeTone(route)
          return (
            <a
              key={route.path}
              href={route.path}
              className={`rounded-lg border px-4 py-3 text-left transition-colors hover:border-accent/45 ${tone.className}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-ui text-[10px] tracking-[0.16em] text-present/38 uppercase">
                    {tone.kicker}
                  </div>
                  <div className="mt-1 font-heading text-base font-semibold text-present">
                    {route.label}
                  </div>
                </div>
                <div className="shrink-0 rounded-full border border-present/10 bg-white/70 px-2.5 py-1 font-mono text-[10px] text-present/50">
                  {tone.value}
                </div>
              </div>
              <div className="mt-2 truncate font-mono text-[11px] text-accent">
                {route.path}
              </div>
              <p className="mt-2 font-ui text-xs leading-relaxed text-present/52">
                {route.description}
              </p>
            </a>
          )
        })}
      </div>
    </div>
  )
}
