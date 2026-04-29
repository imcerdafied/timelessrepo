import { ACTIVE_PROPERTY, getLocationForLayer } from '../config/properties'
import { STORY_TRAILS } from '../data/engagement'
import useStore from '../store/useStore'

const trailStyles = {
  maritime: {
    label: 'Harbor',
    className: 'border-primary/25 bg-primary/[0.06]',
    badge: 'bg-primary/10 text-primary border-primary/20',
  },
  operational: {
    label: 'Ops',
    className: 'border-operational/25 bg-operational/[0.07]',
    badge: 'bg-operational/10 text-operational border-operational/20',
  },
  natural: {
    label: 'Reef',
    className: 'border-cultural/25 bg-cultural/[0.07]',
    badge: 'bg-cultural/10 text-cultural border-cultural/20',
  },
  architectural: {
    label: 'Origins',
    className: 'border-past/25 bg-past/[0.07]',
    badge: 'bg-past/10 text-past border-past/20',
  },
}

export default function StoryTrails() {
  const stamps = useStore((s) => s.passportStamps)
  const stamped = new Set(stamps.map((stamp) => stamp.id))
  const completedTrailCount = STORY_TRAILS.filter((trail) => stamped.has(`trail:${trail.id}`)).length
  const totalStops = STORY_TRAILS.reduce((sum, trail) => sum + trail.stops.length, 0)

  return (
    <div className="flex h-full flex-col bg-background text-present">
      <div className="border-b border-border px-5 pb-5 pt-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-ui text-[10px] tracking-[0.2em] text-accent uppercase">
              Story Trails
            </p>
            <h1 className="mt-1 font-heading text-2xl font-semibold">
              Choose a guest journey
            </h1>
          </div>
          <div className="flex shrink-0 gap-2">
            <a href={`/demo/${ACTIVE_PROPERTY.slug}/passport`} className="rounded-full border border-border px-3 py-1.5 font-ui text-xs text-present/55">
              Passport
            </a>
            <a href="/demos" className="rounded-full border border-border px-3 py-1.5 font-ui text-xs text-present/55">
              Demos
            </a>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border bg-surface px-3 py-2">
            <div className="font-heading text-lg text-accent">{STORY_TRAILS.length}</div>
            <div className="font-ui text-[9px] tracking-[0.14em] text-present/38 uppercase">Trails</div>
          </div>
          <div className="rounded-lg border border-border bg-surface px-3 py-2">
            <div className="font-heading text-lg text-accent">
              {completedTrailCount}
            </div>
            <div className="font-ui text-[9px] tracking-[0.14em] text-present/38 uppercase">Complete</div>
          </div>
          <div className="rounded-lg border border-border bg-surface px-3 py-2">
            <div className="font-heading text-lg text-accent">{totalStops}</div>
            <div className="font-ui text-[9px] tracking-[0.14em] text-present/38 uppercase">Stops</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
        {STORY_TRAILS.map((trail) => {
          const completed = trail.stops.filter((stop) => stamped.has(`layer:${stop.layerId}`)).length
          const nextIndex = trail.stops.findIndex((stop) => !stamped.has(`layer:${stop.layerId}`))
          const startIndex = nextIndex === -1 ? 0 : nextIndex
          const progress = Math.round((completed / trail.stops.length) * 100)
          const style = trailStyles[trail.theme] || trailStyles.maritime
          const trailComplete = stamped.has(`trail:${trail.id}`)

          return (
            <section key={trail.id} className={`rounded-xl border p-4 ${style.className}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 font-ui text-[9px] tracking-[0.12em] uppercase ${style.badge}`}>
                      {style.label}
                    </span>
                    {trailComplete && (
                      <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 font-ui text-[9px] tracking-[0.12em] text-accent uppercase">
                        Stamped
                      </span>
                    )}
                  </div>
                  <div className="mt-2 font-heading text-xl font-semibold leading-tight">{trail.title}</div>
                  <p className="mt-1 font-ui text-xs leading-relaxed text-present/54">{trail.description}</p>
                </div>
                <div className="shrink-0 rounded-full border border-accent/30 px-2.5 py-1 font-mono text-[10px] text-accent">
                  {completed}/{trail.stops.length}
                </div>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/70">
                <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
              </div>

              <div className="mt-4 space-y-2">
                {trail.stops.map((stop, index) => {
                  const location = getLocationForLayer(stop.layerId)
                  const isDone = stamped.has(`layer:${stop.layerId}`)
                  return (
                    <a
                      key={stop.layerId}
                      href={`/demo/${ACTIVE_PROPERTY.slug}/trail/${trail.id}/${index}`}
                      className="flex gap-3 rounded-lg border border-white/65 bg-white/62 p-3 transition-colors hover:border-accent/45"
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${
                        isDone
                          ? 'border-accent/35 bg-accent/15 text-accent'
                          : 'border-present/10 bg-white text-present/45'
                      }`}>
                        {isDone ? '✓' : index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-heading text-sm text-present">{stop.title}</div>
                        <div className="mt-0.5 font-ui text-[11px] text-present/35">{location?.name}</div>
                        <p className="mt-1 font-ui text-xs leading-relaxed text-present/50">{stop.prompt}</p>
                      </div>
                    </a>
                  )
                })}
              </div>

              <a
                href={`/demo/${ACTIVE_PROPERTY.slug}/trail/${trail.id}/${startIndex}`}
                className="mt-4 block rounded-full bg-accent px-4 py-2.5 text-center font-ui text-xs font-medium text-background"
              >
                {trailComplete ? 'Review Trail' : completed > 0 ? 'Continue Trail' : 'Start Trail'}
              </a>
            </section>
          )
        })}
      </div>
    </div>
  )
}
