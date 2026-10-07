// Email confirmation. A new account is held as "pending" until its owner opens a link we email them; only then does it
// become a real account and a session start. The link carries a random token that is stored only as a hash, works
// once, and expires after 24 hours.
//
//   sendConfirmation   mails a fresh link (at most one a minute, and five an hour, per address)
//   lookUpLink         whose sign-up a link belongs to, without using it up (for the page that asks "confirm?")
//   confirmWithLink    uses the link up and turns the pending account into a confirmed one

import { createHash, randomBytes } from 'node:crypto'
import { createError } from 'h3'
import { LINK_SECONDS, RESEND_WAIT_SECONDS } from './config.js'
import { rateKeys } from './guard.js'
import { confirmationEmail } from './mail-template.js'

const MAILS_PER_ADDRESS = { max: 5, windowSec: 60 * 60 }

const newToken = () => randomBytes(32).toString('base64url') // 256 bits
const hashToken = (token) => createHash('sha256').update(token).digest('hex')
// Anything that is not the shape of a token we issued cannot be one, so it is turned away before it reaches Redis.
const looksLikeToken = (value) => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value)

/** The name of the "wait before sending again" timer for one address. */
export const resendTimer = (email) => `resend:${email}`

/**
 * Throws 429 when this address has already been sent its share of emails this hour. Sign-up asks this first, so a
 * sign-up that cannot be mailed does not replace the account it would have replaced.
 */
export async function assertMailAllowed(store, email) {
  if ((await store.rateCount(rateKeys.mailByEmail(email))) >= MAILS_PER_ADDRESS.max) {
    throw createError({ statusCode: 429, statusMessage: 'Too many emails have been sent to this address. Try again in an hour.' })
  }
}

/**
 * Email `user` (an unconfirmed account) a fresh confirmation link, unless one went out less than a minute ago.
 * `force` skips that wait, for a sign-up that has just replaced the account the earlier link belonged to.
 * -> { sent, resendIn }: whether an email went out now, and how many seconds until another may.
 * Throws 429 when this address has been sent too many emails this hour.
 */
export async function sendConfirmation({ store, mailer, origin, user, force = false }) {
  const timer = resendTimer(user.email)
  if (force) await store.release(timer)
  if (!(await store.claim(timer, RESEND_WAIT_SECONDS))) return { sent: false, resendIn: await store.secondsLeft(timer) }

  try {
    await assertMailAllowed(store, user.email)
    await store.rateHit(rateKeys.mailByEmail(user.email), MAILS_PER_ADDRESS.windowSec)

    const token = newToken()
    await store.putLink(hashToken(token), { email: user.email, userId: user.id }, LINK_SECONDS)
    const link = `${origin}/verify-email?token=${token}`
    await mailer.send({ to: user.email, ...confirmationEmail({ name: user.name, link, hours: LINK_SECONDS / 3600 }) })
  } catch (error) {
    await store.release(timer) // nothing went out, so there is nothing to wait for
    throw error
  }
  return { sent: true, resendIn: RESEND_WAIT_SECONDS }
}

/** The pending account a link record points at, or null when it is gone (expired, confirmed, or replaced by a newer sign-up). */
async function pendingFor(store, record) {
  if (!record) return null
  const pending = await store.getPending(record.email)
  return pending && pending.id === record.userId ? pending : null
}

/** The pending account this token belongs to, or null. Leaves the link usable. */
export async function lookUpLink(store, token) {
  if (!looksLikeToken(token)) return null
  return pendingFor(store, await store.peekLink(hashToken(token)))
}

/** Use the link up and confirm its account. -> the confirmed user, or null when the link does not work. */
export async function confirmWithLink(store, token) {
  if (!looksLikeToken(token)) return null
  const pending = await pendingFor(store, await store.takeLink(hashToken(token))) // the link is spent from here on
  if (!pending) return null

  const user = { ...pending, verifiedAt: new Date().toISOString() }
  if (!(await store.createUser(user))) return null // that address was confirmed by someone else in the meantime
  await store.deletePending(user.email)
  return user
}
