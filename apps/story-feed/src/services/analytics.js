import posthog from 'posthog-js'

export const track = (event, properties = {}) => {
  try {
    posthog.capture(event, properties)
  } catch {
    // PostHog not initialized
  }
}
