// POST /api/auth/resend  ->  { pending: { email, resendIn } }
//
// Emails the confirmation link again to the address this browser signed up (or tried to sign in) with. It takes no
// address from the request: the browser's own cookie says which one, so this cannot be pointed at anyone else.
import { createError } from 'h3'
import { assertConfigured, sessionSecret } from '../../auth/config.js'
import { assertSameOrigin, defineAuthHandler } from '../../auth/guard.js'
import { getMailer, siteOrigin } from '../../auth/mail.js'
import { readSession } from '../../auth/session.js'
import { getAuthStore } from '../../auth/store.js'
import { sendConfirmation } from '../../auth/verification.js'

export default defineAuthHandler(async (event) => {
  assertSameOrigin(event)
  assertConfigured()
  sessionSecret()

  const { pending } = await readSession(event)
  if (!pending) {
    throw createError({ statusCode: 409, statusMessage: 'There is no sign-up waiting for an email. Create an account or sign in.' })
  }

  const mailer = getMailer()
  const origin = siteOrigin(event)
  const store = getAuthStore()

  const user = await store.getPending(pending.email)
  if (!user) {
    const confirmed = await store.getUser(pending.email)
    throw createError(
      confirmed?.verifiedAt
        ? { statusCode: 409, statusMessage: 'This email is already confirmed. Sign in to continue.' }
        : { statusCode: 410, statusMessage: 'This sign-up has expired. Create the account again.' },
    )
  }

  const { sent, resendIn } = await sendConfirmation({ store, mailer, origin, user })
  if (!sent) {
    throw createError({ statusCode: 429, statusMessage: 'Wait a moment before asking for another email.', data: { retryAfter: resendIn } })
  }
  return { pending: { email: user.email, resendIn } }
})
