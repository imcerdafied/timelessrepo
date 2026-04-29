import propertyData from '../../../../packages/content/properties.json'
import locationsData from '../data/locations.json'

const DEFAULT_SLUG = import.meta.env.VITE_PROPERTY_SLUG || propertyData.defaultPropertySlug || 'atlantis'

function slugFromPath(pathname) {
  const match = pathname.match(/^\/demo\/([^/]+)/)
  return match?.[1]
}

export function getProperty(slug = DEFAULT_SLUG) {
  return (
    propertyData.properties.find((property) => property.slug === slug || property.id === slug) ||
    propertyData.properties.find((property) => property.slug === DEFAULT_SLUG) ||
    propertyData.properties[0]
  )
}

export const ACTIVE_PROPERTY = getProperty(
  typeof window === 'undefined' ? DEFAULT_SLUG : slugFromPath(window.location.pathname) || DEFAULT_SLUG
)

export function getPropertyLocations(property = ACTIVE_PROPERTY) {
  const zoneSet = new Set(property.zones)
  return locationsData.locations.filter((location) => zoneSet.has(location.id))
}

export function getLocationForLayer(layerId, property = ACTIVE_PROPERTY) {
  if (!layerId) return null
  return getPropertyLocations(property).find((location) =>
    location.eras?.some((era) => era.id === layerId)
  )
}

export function getEraById(layerId, property = ACTIVE_PROPERTY) {
  const location = getLocationForLayer(layerId, property)
  return location?.eras?.find((era) => era.id === layerId) || null
}

export function getDefaultRouteTarget(property = ACTIVE_PROPERTY) {
  return {
    zoneId: property.defaultZoneId || property.zones[0],
    layerId: property.defaultLayerId,
  }
}

export const properties = propertyData.properties
