// GET /api/auth/me  ->  { user, pending }
//   user     { id, name, email } when signed in, else null
//   pending  { email, resendIn } when this browser has an account waiting for its email link, else null
// Answers 200 with nulls for visitors who are not signed in, and never sets a cookie.
import { defineAuthHandler } from '../../auth/guard.js'
import { readSession } from '../../auth/session.js'
import { getAuthStore } from '../../auth/store.js'
import { resendTimer } from '../../auth/verification.js'

export default defineAuthHandler(async (event) => {
  const { user, pending } = await readSession(event)
  if (!pending) return { user, pending: null }

  let resendIn = 0
  try {
    resendIn = await getAuthStore().secondsLeft(resendTimer(pending.email))
  } catch {
    // the page can still name the address; the wait just shows as over
  }
  return { user: null, pending: { email: pending.email, resendIn } }
})
