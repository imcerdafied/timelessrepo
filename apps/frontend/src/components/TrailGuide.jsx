import { ACTIVE_PROPERTY, getLocationForLayer } from '../config/properties'
import useStore from '../store/useStore'

function firstName(name) {
  return name?.split(' ')[0] || 'character'
}

export default function TrailGuide({
  trail,
  stepIndex = 0,
  characterName,
  onAskCharacter,
  onExperienceStop,
  onOpenPassport,
}) {
  const awardStamp = useStore((s) => s.awardStamp)
  if (!trail) return null

  const step = trail.stops[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === trail.stops.length - 1
  const previousHref = isFirst ? null : `/demo/${ACTIVE_PROPERTY.slug}/trail/${trail.id}/${stepIndex - 1}`
  const nextHref = isLast ? null : `/demo/${ACTIVE_PROPERTY.slug}/trail/${trail.id}/${stepIndex + 1}`
  const location = getLocationForLayer(step?.layerId)
  const hasCharacterAction = !!characterName && !!onAskCharacter
  const primaryLabel = hasCharacterAction ? `Ask ${firstName(characterName)}` : 'Experience Stop'
  const primaryAction = hasCharacterAction ? onAskCharacter : onExperienceStop

  function completeTrail() {
    awardStamp({
      id: `trail:${trail.id}`,
      type: 'trail',
      label: trail.title,
      detail: `${trail.stops.length} stops completed`,
      href: `/demo/${ACTIVE_PROPERTY.slug}/trails`,
    })
    onOpenPassport?.()
  }

  return (
    <div className="absolute left-3 right-3 top-20 z-30 rounded-2xl border border-accent/35 bg-[#080705]/90 p-4 text-white shadow-2xl backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-ui text-[10px] tracking-[0.18em] text-accent uppercase">
            Story Trail {stepIndex + 1}/{trail.stops.length}
          </div>
          <div className="mt-1 truncate font-heading text-lg font-semibold text-white">
            {trail.title}
          </div>
        </div>
        <a
          href={`/demo/${ACTIVE_PROPERTY.slug}/trails`}
          className="rounded-full border border-white/15 px-3 py-1.5 font-ui text-[10px] text-white/60"
        >
          Trails
        </a>
      </div>

      <div className="mt-3 flex gap-1">
        {trail.stops.map((stop, index) => (
          <div
            key={stop.layerId}
            className={`h-1 flex-1 rounded-full ${index <= stepIndex ? 'bg-accent' : 'bg-white/14'}`}
          />
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-white/12 bg-white/[0.06] p-3">
        <div className="font-ui text-[10px] tracking-[0.16em] text-accent/80 uppercase">
          Your move
        </div>
        <div className="mt-1 font-heading text-base text-white">
          {step?.title}
        </div>
        <div className="mt-0.5 font-ui text-[11px] text-white/45">
          {location?.name}
        </div>
        <p className="mt-2 font-ui text-xs leading-relaxed text-white/72">
          Meet the character, play the moment, or jump to the next stop.
        </p>
        <p className="mt-2 rounded-lg border border-accent/25 bg-accent/10 px-3 py-2 font-ui text-xs leading-relaxed text-accent">
          {step?.prompt}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          data-testid="trail-ask-character"
          onClick={primaryAction}
          className="rounded-full bg-accent px-3 py-2.5 text-center font-ui text-xs font-semibold text-background"
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          data-testid="trail-play-moment"
          onClick={onExperienceStop}
          className="rounded-full border border-white/15 px-3 py-2.5 text-center font-ui text-xs text-white/70"
        >
          Play Moment
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        {previousHref ? (
          <a href={previousHref} className="flex-1 rounded-full border border-white/15 px-3 py-2 text-center font-ui text-xs text-white/55">
            Previous
          </a>
        ) : (
          <span className="flex-1 rounded-full border border-white/10 px-3 py-2 text-center font-ui text-xs text-white/25">
            Previous
          </span>
        )}
        {nextHref ? (
          <a data-testid="trail-next-stop" href={nextHref} className="flex-1 rounded-full border border-accent/35 px-3 py-2 text-center font-ui text-xs font-medium text-accent">
            Next Stop
          </a>
        ) : (
          <button onClick={completeTrail} className="flex-1 rounded-full border border-accent/35 px-3 py-2 text-center font-ui text-xs font-medium text-accent">
            Complete Trail
          </button>
        )}
      </div>
    </div>
  )
}
