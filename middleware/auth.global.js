// Sends visitors without an account to /sign-in before they can reach the demo, and sends people who are already
// signed in away from the sign-in pages. Runs on every navigation, on the server for the first page view and in the
// browser afterwards. (The demo's API enforces the same rule on its own; see server/middleware/auth.js.)
//
// "Check your inbox" only makes sense for a browser that has just made (or tried to sign in to) an account waiting for
// its email link; anyone else is sent to sign in. The confirmation page itself, /verify-email, is open to everyone:
// the link in the email has to work on whichever device it is opened on.
import { safeRedirect } from '~~/server/auth/rules.js'

// Pages that need an account. Compared case-insensitively: the itinerary page lives in a folder called "Itinerary"
// but the form links to "/itinerary". Add a path here to put another page behind sign-in.
const PROTECTED_PATHS = ['/vacationform', '/itinerary']
const AUTH_PAGES = ['/sign-in', '/sign-up']
const WAITING_PAGE = '/check-email'

const isUnder = (path, base) => path === base || path.startsWith(`${base}/`)

export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, pending, ready, refresh } = useAuth()
  if (!ready.value) await refresh()

  const path = to.path.toLowerCase()

  if (!loggedIn.value && PROTECTED_PATHS.some((base) => isUnder(path, base))) {
    return navigateTo({ path: '/sign-in', query: { redirect: to.fullPath } })
  }

  if (loggedIn.value && [...AUTH_PAGES, WAITING_PAGE].some((base) => isUnder(path, base))) {
    const wanted = Array.isArray(to.query.redirect) ? to.query.redirect[0] : to.query.redirect
    return navigateTo(safeRedirect(wanted, DEMO_ROUTE))
  }

  if (!loggedIn.value && !pending.value && isUnder(path, WAITING_PAGE)) {
    return navigateTo('/sign-in')
  }
})
