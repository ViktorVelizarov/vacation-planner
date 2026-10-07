// The demo is for people with an account, so the demo's API is closed to everyone else, however it is called.
// Default-deny: every /api route needs a signed-in user except the auth endpoints below, which means an
// endpoint added later is protected without anyone remembering to protect it.
import { defineEventHandler, getRequestURL } from 'h3'
import { requireUser } from '../auth/session.js'

const PUBLIC_PREFIXES = ['/api/auth/']

export default defineEventHandler(async (event) => {
  // lower-cased and with repeated slashes collapsed, so "/API//GetItinerary" cannot slip past the prefix check
  const path = getRequestURL(event).pathname.toLowerCase().replace(/\/{2,}/g, '/')
  if (!path.startsWith('/api/')) return
  if (PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix))) return
  event.context.user = await requireUser(event)
})
