import data from './locations.json' with { type: 'json' }

export const locations = data.locations

export function getLocation(id) {
  return locations.find((l) => l.id === id)
}

export function getErasForLocation(locationId) {
  return getLocation(locationId)?.eras ?? []
}

export default data
