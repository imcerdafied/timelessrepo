import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const propertyPath = path.join(__dirname, '..', '..', '..', '..', 'packages', 'content', 'properties.json')

function loadPropertyData() {
  try {
    return JSON.parse(fs.readFileSync(propertyPath, 'utf-8'))
  } catch (err) {
    console.warn('Property config: failed to load manifest', err.message)
    return { defaultPropertySlug: 'atlantis', properties: [] }
  }
}

const propertyData = loadPropertyData()

export function getProperties() {
  return propertyData.properties
}

export function getProperty(slug = process.env.PROPERTY_SLUG || propertyData.defaultPropertySlug) {
  return (
    propertyData.properties.find((property) => property.slug === slug || property.id === slug) ||
    propertyData.properties.find((property) => property.slug === propertyData.defaultPropertySlug) ||
    propertyData.properties[0] ||
    null
  )
}

export function getActiveProperty() {
  return getProperty()
}
