// The free allowance: every account can have FREE_TRIPS plans drafted, then a plan is a paid feature (not open yet).
// The count lives in Upstash next to the account (key demos:<userId>), so it follows the account to any browser.
//
//   - A trip is taken from the allowance before the model is asked, and given back when no plan comes out of it, so a
//     failure never costs a trip.
//   - A plan that was already drafted for the same trip (same destination, days and interests) in the last day is served
//     again without taking another trip: refreshing /itinerary or pressing Back must not use up the allowance.
import { createHash } from 'node:crypto'
import { FREE_TRIPS } from '~~/utils/limits.js'

export { FREE_TRIPS }
export const PLAN_KEPT_SECONDS = 60 * 60 * 24

/**
 * Accounts listed in UNLIMITED_TRIP_EMAILS (comma-separated addresses) have no limit: for the owner's own testing, so a
 * developer can plan as many trips as they like. Nobody else can switch it on; it is read from the server's environment.
 */
export function hasNoLimit(user) {
  const listed = (process.env.UNLIMITED_TRIP_EMAILS ?? '').split(',').map((entry) => entry.trim().toLowerCase()).filter(Boolean)
  return listed.includes(String(user.email).toLowerCase())
}

/** What the trip form shows: { limit, used, left }, or { unlimited: true } for an account without a limit. */
export async function demoStatus(store, user) {
  if (hasNoLimit(user)) return { unlimited: true }
  const used = Math.min(await store.demoCount(user.id), FREE_TRIPS)
  return { limit: FREE_TRIPS, used, left: FREE_TRIPS - used }
}

/** The same trip always gives the same key, however the destination is capitalised or the interests are ordered. */
export function tripKey({ destination, days, interests }) {
  const canonical = JSON.stringify([destination.trim().toLowerCase(), days, [...interests].map((i) => i.toLowerCase()).sort()])
  return createHash('sha256').update(canonical).digest('hex').slice(0, 24)
}
