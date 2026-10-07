// POST /api/auth/verify  { token }  ->  { user } and a session cookie
//
// The button on /verify-email. Uses the emailed link up (it works once), confirms the account and signs the
// visitor in, on this device, which may not be the one the account was made on.
import { createError } from 'h3'
import { assertConfigured, sessionSecret } from '../../auth/config.js'
import { assertSameOrigin, assertUnderLimit, clientIp, defineAuthHandler, rateKeys, readJson } from '../../auth/guard.js'
import { publicUser, startSession } from '../../auth/session.js'
import { getAuthStore } from '../../auth/store.js'
import { confirmWithLink } from '../../auth/verification.js'

const BAD_LINKS = { max: 30, windowSec: 15 * 60 }

export default defineAuthHandler(async (event) => {
  assertSameOrigin(event)
  assertConfigured({ mail: false })
  sessionSecret()

  const { token } = await readJson(event)
  const store = getAuthStore()
  const limit = { key: rateKeys.badLinkByIp(clientIp(event)), ...BAD_LINKS }
  await assertUnderLimit(store, [limit])

  const user = await confirmWithLink(store, token)
  if (!user) {
    await store.rateHit(limit.key, limit.windowSec)
    throw createError({ statusCode: 410, statusMessage: 'This link has expired or was already used.' })
  }

  await startSession(event, user)
  return { user: publicUser(user) }
})
