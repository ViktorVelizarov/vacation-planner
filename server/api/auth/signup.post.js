// POST /api/auth/signup  { name, email, password }  ->  { pending: { email, resendIn } }
//
// Makes an unconfirmed account and emails its owner a link. Nobody is signed in until that link is used, so a
// sign-up with someone else's address leaves them with an email they can ignore and the sign-up with nothing.
// An address whose account was never confirmed can be signed up again (the new sign-up replaces the old one);
// a confirmed one cannot.
import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import { validateSignup } from '../../auth/rules.js'
import { UNCONFIRMED_SECONDS, assertConfigured, sessionSecret } from '../../auth/config.js'
import { assertSameOrigin, assertUnderLimit, clientIp, defineAuthHandler, rateKeys, readJson } from '../../auth/guard.js'
import { getMailer, siteOrigin } from '../../auth/mail.js'
import { hashPassword } from '../../auth/password.js'
import { startPending } from '../../auth/session.js'
import { getAuthStore } from '../../auth/store.js'
import { assertMailAllowed, sendConfirmation } from '../../auth/verification.js'

const SIGNUPS_PER_IP = { max: 10, windowSec: 60 * 60 }

export default defineAuthHandler(async (event) => {
  assertSameOrigin(event)

  const { ok, values, errors } = validateSignup(await readJson(event))
  if (!ok) {
    const field = Object.keys(errors)[0]
    throw createError({ statusCode: 400, statusMessage: errors[field], data: { field, errors } })
  }

  // A deployment that cannot store accounts, seal a cookie or send email fails here, plainly, before any password
  // work and before anything is saved: an account nobody can confirm would be a dead end.
  assertConfigured()
  sessionSecret()
  const mailer = getMailer()
  const origin = siteOrigin(event)
  const store = getAuthStore()

  const limit = { key: rateKeys.signupByIp(clientIp(event)), ...SIGNUPS_PER_IP }
  await assertUnderLimit(store, [limit])
  await store.rateHit(limit.key, limit.windowSec)
  await assertMailAllowed(store, values.email) // before anything is replaced: a sign-up that cannot be mailed changes nothing

  const taken = await store.getUser(values.email)
  if (taken?.verifiedAt) {
    throw createError({ statusCode: 409, statusMessage: 'An account with this email already exists.', data: { field: 'email' } })
  }
  if (taken) await store.deleteUser(values.email) // made before confirmation existed: unconfirmed, so this sign-up replaces it

  const user = {
    id: `usr_${randomUUID()}`,
    name: values.name,
    email: values.email,
    passwordHash: await hashPassword(values.password),
    createdAt: new Date().toISOString(),
  }
  await store.savePending(user, UNCONFIRMED_SECONDS)
  const { resendIn } = await sendConfirmation({ store, mailer, origin, user, force: true })

  await startPending(event, user.email)
  return { pending: { email: user.email, resendIn } }
})
