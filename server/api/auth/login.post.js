// POST /api/auth/login  { email, password }  ->  { user } and a session cookie
//                                          or ->  { pending: { email, resendIn, sent } } when the account's email
//                                                 was never confirmed (nobody is signed in; a fresh link is emailed)
import { createError } from 'h3'
import { validateLogin } from '../../auth/rules.js'
import { UNCONFIRMED_SECONDS, assertConfigured, sessionSecret } from '../../auth/config.js'
import { assertSameOrigin, assertUnderLimit, clientIp, defineAuthHandler, rateKeys, readJson } from '../../auth/guard.js'
import { getMailer, siteOrigin } from '../../auth/mail.js'
import { dummyHash, verifyPassword } from '../../auth/password.js'
import { publicUser, startPending, startSession } from '../../auth/session.js'
import { getAuthStore } from '../../auth/store.js'
import { sendConfirmation } from '../../auth/verification.js'

const WINDOW = 15 * 60

export default defineAuthHandler(async (event) => {
  assertSameOrigin(event)

  const { ok, values, errors } = validateLogin(await readJson(event))
  if (!ok) {
    const field = Object.keys(errors)[0]
    throw createError({ statusCode: 400, statusMessage: errors[field], data: { field, errors } })
  }

  // Failed attempts are counted per (address, email) and per address, then blocked for the rest of the window.
  assertConfigured({ mail: false }) // signing in to a confirmed account never needs the email service
  const store = getAuthStore()
  sessionSecret() // a misconfigured deployment fails here, plainly, before any password work
  const ip = clientIp(event)
  const counters = [
    { key: rateKeys.loginByEmail(ip, values.email), max: 8, windowSec: WINDOW },
    { key: rateKeys.loginByIp(ip), max: 40, windowSec: WINDOW },
  ]
  await assertUnderLimit(store, counters)

  // Confirmed accounts first, then sign-ups still waiting for their link. Always run one scrypt check, even for an
  // unknown email, so timing does not reveal which emails exist.
  const confirmed = await store.getUser(values.email)
  const account = confirmed ?? (await store.getPending(values.email))
  const matches = await verifyPassword(values.password, account?.passwordHash ?? (await dummyHash()))
  if (!account || !matches) {
    await Promise.all(counters.map(({ key, windowSec }) => store.rateHit(key, windowSec)))
    throw createError({ statusCode: 401, statusMessage: 'Incorrect email or password.' })
  }

  await store.rateReset(counters[0].key)
  if (account.verifiedAt) {
    await startSession(event, account)
    return { user: publicUser(account) }
  }

  // The password is right but the email address was never confirmed, so nobody is signed in. Send the link again
  // (not more than once a minute) and let the visitor know where to look.
  const mailer = getMailer()
  const origin = siteOrigin(event)
  if (confirmed) {
    // an account made before confirmation existed: from now on it is confirmed like any new sign-up
    await store.savePending(confirmed, UNCONFIRMED_SECONDS)
    await store.deleteUser(values.email)
  }
  const { sent, resendIn } = await sendConfirmation({ store, mailer, origin, user: account })
  await startPending(event, account.email)
  return { pending: { email: account.email, resendIn, sent } }
})
