import data from './locations.json' with { type: 'json' }
import propertyData from './properties.json' with { type: 'json' }

export const locations = data.locations
export const properties = propertyData.properties
export const defaultPropertySlug = propertyData.defaultPropertySlug

export function getLocation(id) {
  return locations.find((l) => l.id === id)
}

export function getErasForLocation(locationId) {
  return getLocation(locationId)?.eras ?? []
}

export function getProperty(slug = defaultPropertySlug) {
  return properties.find((property) => property.slug === slug || property.id === slug)
}

export default data
