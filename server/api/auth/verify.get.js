// GET /api/auth/verify?token=...  ->  { email }  when the link can still be used, 410 when it cannot
//
// Only looks: the link is not used up. Opening an emailed link must never confirm anything by itself, because mail
// programs and security scanners open links to check them. The page shows this address and asks for a button press,
// and the press is the POST in verify.post.js.
import { createError, getQuery } from 'h3'
import { assertConfigured, sessionSecret } from '../../auth/config.js'
import { assertUnderLimit, clientIp, defineAuthHandler, rateKeys } from '../../auth/guard.js'
import { getAuthStore } from '../../auth/store.js'
import { lookUpLink } from '../../auth/verification.js'

const BAD_LINKS = { max: 30, windowSec: 15 * 60 }

export default defineAuthHandler(async (event) => {
  assertConfigured({ mail: false })
  sessionSecret()
  const store = getAuthStore()
  const limit = { key: rateKeys.badLinkByIp(clientIp(event)), ...BAD_LINKS }
  await assertUnderLimit(store, [limit])

  const pending = await lookUpLink(store, getQuery(event).token)
  if (!pending) {
    await store.rateHit(limit.key, limit.windowSec)
    throw createError({ statusCode: 410, statusMessage: 'This link has expired or was already used.' })
  }
  return { email: pending.email }
})
