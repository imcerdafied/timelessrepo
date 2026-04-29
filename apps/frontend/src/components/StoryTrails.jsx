import { ACTIVE_PROPERTY, getLocationForLayer } from '../config/properties'
import { STORY_TRAILS } from '../data/engagement'
import useStore from '../store/useStore'

export default function StoryTrails() {
  const stamps = useStore((s) => s.passportStamps)
  const stamped = new Set(stamps.map((stamp) => stamp.id))

  return (
    <div className="flex h-full flex-col bg-background px-5 py-8 text-present">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-ui text-[10px] tracking-[0.2em] text-accent uppercase">
              Story Trails
            </p>
            <h1 className="mt-1 font-heading text-2xl font-semibold">
              Guided paths through Atlantis
            </h1>
          </div>
          <a href="/demos" className="rounded-full border border-border px-3 py-1.5 font-ui text-xs text-present/50">
            Demos
          </a>
        </div>
        <p className="mt-2 font-ui text-sm leading-relaxed text-present/55">
          Curated sequences that turn separate layers into a visit guests can follow, finish, and share.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4 overflow-y-auto pb-6">
        {STORY_TRAILS.map((trail) => {
          const completed = trail.stops.filter((stop) => stamped.has(`layer:${stop.layerId}`)).length
          const firstStop = trail.stops[0]
          return (
            <section key={trail.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-heading text-lg font-semibold">{trail.title}</div>
                  <p className="mt-1 font-ui text-xs leading-relaxed text-present/50">{trail.description}</p>
                </div>
                <div className="shrink-0 rounded-full border border-accent/30 px-2.5 py-1 font-mono text-[10px] text-accent">
                  {completed}/{trail.stops.length}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {trail.stops.map((stop, index) => {
                  const location = getLocationForLayer(stop.layerId)
                  return (
                    <a
                      key={stop.layerId}
                      href={`/demo/${ACTIVE_PROPERTY.slug}/trail/${trail.id}/${index}`}
                      className="flex gap-3 rounded-md border border-present/10 bg-present/[0.03] p-3 transition-colors hover:border-accent/40"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 font-mono text-[10px] text-accent">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-heading text-sm text-present">{stop.title}</div>
                        <div className="mt-0.5 font-ui text-[11px] text-present/35">{location?.name}</div>
                        <p className="mt-1 font-ui text-xs leading-relaxed text-present/50">{stop.prompt}</p>
                      </div>
                    </a>
                  )
                })}
              </div>

              <a
                href={`/demo/${ACTIVE_PROPERTY.slug}/trail/${trail.id}/0`}
                className="mt-4 block rounded-full bg-accent px-4 py-2.5 text-center font-ui text-xs font-medium text-background"
              >
                Start Trail
              </a>
            </section>
          )
        })}
      </div>
    </div>
  )
}
