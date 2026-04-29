import { ACTIVE_PROPERTY } from '../config/properties'

export default function DemoDirectory() {
  return (
    <div className="flex h-full flex-col bg-background px-5 py-8">
      <div>
        <p className="font-ui text-[10px] tracking-[0.2em] text-accent uppercase">
          Demo Directory
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-present">
          {ACTIVE_PROPERTY.brandName}
        </h1>
        <p className="mt-2 font-ui text-sm leading-relaxed text-present/55">
          Clean entry points for the experience intelligence module, ready for Phunware review.
        </p>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-3 overflow-y-auto pb-6">
        {ACTIVE_PROPERTY.demoRoutes.map((route) => (
          <a
            key={route.path}
            href={route.path}
            className="rounded-sm border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-accent/40"
          >
            <div className="font-heading text-base font-semibold text-present">
              {route.label}
            </div>
            <div className="mt-1 font-mono text-[11px] text-accent">
              {route.path}
            </div>
            <p className="mt-2 font-ui text-xs leading-relaxed text-present/50">
              {route.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  )
}
