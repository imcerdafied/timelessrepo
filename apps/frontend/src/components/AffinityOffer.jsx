export default function AffinityOffer({ offer, trail, onAction }) {
  if (!offer) return null

  return (
    <div className="my-5 rounded-2xl border border-accent/25 bg-accent/10 p-4">
      <div className="font-ui text-[10px] tracking-[0.18em] text-accent uppercase">
        Suggested next step
      </div>
      <div className="mt-1 font-heading text-lg font-semibold text-present">
        {trail?.title || offer.title}
      </div>
      <p className="mt-2 font-ui text-sm leading-relaxed text-present/60">
        {trail?.description || offer.description}
      </p>
      <button
        onClick={onAction}
        className="mt-3 rounded-full border border-accent/40 px-4 py-2 font-ui text-xs font-medium text-accent"
      >
        {trail ? 'Open Story Trails' : offer.cta}
      </button>
    </div>
  )
}
