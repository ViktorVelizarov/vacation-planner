// POST /api/auth/logout  ->  { ok: true }  and the session cookie removed
import { assertSameOrigin, defineAuthHandler } from '../../auth/guard.js'
import { endSession } from '../../auth/session.js'

export default defineAuthHandler(async (event) => {
  assertSameOrigin(event)
  await endSession(event)
  return { ok: true }
})
