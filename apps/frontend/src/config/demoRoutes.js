import {
  ACTIVE_PROPERTY,
  getDefaultRouteTarget,
  getLocationForLayer,
} from './properties'
import { getTrailStep } from '../data/engagement'

function propertyPrefix(property = ACTIVE_PROPERTY) {
  return `/demo/${property.slug}`
}

export function getDemoRoute(pathname = window.location.pathname, property = ACTIVE_PROPERTY) {
  const prefix = propertyPrefix(property)
  const defaults = getDefaultRouteTarget(property)

  if (pathname === '/' || pathname === '/demo' || pathname === '/demos') {
    return { view: 'directory' }
  }

  if (pathname === '/admin' || pathname === `${prefix}/signals`) {
    return { view: 'signals' }
  }

  if (pathname === `${prefix}/zones`) {
    return { view: 'zones' }
  }

  if (pathname.startsWith(`${prefix}/trail/`)) {
    const [trailId, stepRaw] = pathname.slice(`${prefix}/trail/`.length).split('/').filter(Boolean)
    const { trail, step, stepIndex } = getTrailStep(trailId, stepRaw)
    const location = getLocationForLayer(step?.layerId, property)

    if (!trail || !step) {
      return { view: 'trails' }
    }

    return {
      view: 'experience',
      tool: 'trail',
      trailId,
      trailStep: stepIndex,
      zoneId: location?.id || defaults.zoneId,
      layerId: step.layerId || defaults.layerId,
    }
  }

  if (pathname === `${prefix}/trails` || pathname.startsWith(`${prefix}/trails/`)) {
    return { view: 'trails' }
  }

  if (pathname === `${prefix}/passport`) {
    return { view: 'passport' }
  }

  if (pathname.startsWith(`${prefix}/timelens`)) {
    const layerId = pathname.slice(`${prefix}/timelens`.length).split('/').filter(Boolean)[0]
    const location = getLocationForLayer(layerId, property)
    return {
      view: 'experience',
      tool: 'timelens',
      zoneId: location?.id || defaults.zoneId,
      layerId: layerId || defaults.layerId,
    }
  }

  if (pathname.startsWith(`${prefix}/moment`)) {
    const layerId = pathname.slice(`${prefix}/moment`.length).split('/').filter(Boolean)[0]
    const location = getLocationForLayer(layerId, property)
    return {
      view: 'experience',
      tool: 'moment',
      zoneId: location?.id || defaults.zoneId,
      layerId: layerId || defaults.layerId,
    }
  }

  if (pathname.startsWith(`${prefix}/layer`)) {
    const layerId = pathname.slice(`${prefix}/layer`.length).split('/').filter(Boolean)[0]
    const location = getLocationForLayer(layerId, property)
    return {
      view: 'experience',
      zoneId: location?.id || defaults.zoneId,
      layerId: layerId || defaults.layerId,
    }
  }

  if (pathname.startsWith(`${prefix}/zone`)) {
    const zoneId = pathname.slice(`${prefix}/zone`.length).split('/').filter(Boolean)[0]
    return {
      view: 'experience',
      zoneId: property.zones.includes(zoneId) ? zoneId : defaults.zoneId,
    }
  }

  if (pathname === prefix || pathname === `${prefix}/`) {
    return { view: 'today' }
  }

  return { view: 'today' }
}

export function demoPath(path, property = ACTIVE_PROPERTY) {
  return path.replace('/demo/atlantis', propertyPrefix(property))
}
