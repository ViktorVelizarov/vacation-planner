// The signed-in state lives in one cookie: h3's sealed session (encrypted and signed with the session secret).
// There is no server-side session table to look up. The cookie says one of two things:
//   { user: { id, name, email } }     signed in
//   { pending: { email, at } }        an account was just made (or signed in to) but its email is not confirmed yet;
//                                      this is how /check-email knows which address to talk about, and what "resend"
//                                      is allowed to send to. It is not a sign-in: nothing is unlocked by it.
//
// Reads use getCookie + unsealSession rather than useSession on purpose: useSession creates and sets a fresh
// cookie for every anonymous visitor, and the landing page asks "who is this?" on every view.

import { randomUUID } from 'node:crypto'
import { clearSession, createError, getCookie, getRequestProtocol, unsealSession, updateSession } from 'h3'
import { COOKIE_NAME, LINK_SECONDS, SESSION_SECONDS, sessionSecret } from './config.js'

const config = (event, password) => ({
  name: COOKIE_NAME,
  password,
  maxAge: SESSION_SECONDS,
  sessionHeader: false, // the cookie is the only way in
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: getRequestProtocol(event) === 'https', // https on Vercel; plain http only on localhost
  },
})

export const publicUser = ({ id, name, email }) => ({ id, name, email })

/** What this request's cookie says: { user, pending }, each possibly null. Never throws and never sets a cookie. */
export async function readSession(event) {
  const sealed = getCookie(event, COOKIE_NAME)
  if (!sealed) return { user: null, pending: null }
  try {
    const session = await unsealSession(event, config(event, sessionSecret()), sealed)
    const { user, pending } = session?.data ?? {}
    if (user && typeof user.id === 'string') return { user: publicUser(user), pending: null }
    // a waiting sign-up is remembered only as long as its link can still be used
    const fresh = typeof pending?.email === 'string' && Date.now() - Number(pending.at) < LINK_SECONDS * 1000
    return { user: null, pending: fresh ? { email: pending.email } : null }
  } catch {
    return { user: null, pending: null } // tampered, expired, or sealed with an old secret: treat as signed out
  }
}

/** The signed-in user, or null. */
export async function readSessionUser(event) {
  return (await readSession(event)).user
}

/** Throws 401 unless someone is signed in; returns the user. */
export async function requireUser(event) {
  const user = await readSessionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to use the demo.' })
  return user
}

/**
 * Replace this browser's session with `data`. Always a brand-new session (new id, a full 30 days from now), written
 * once: handing h3 the finished session avoids useSession's extra empty cookie.
 */
async function writeSession(event, data) {
  const settings = config(event, sessionSecret())
  event.context.sessions = {
    ...event.context.sessions,
    [COOKIE_NAME]: { id: randomUUID(), createdAt: Date.now(), data },
  }
  await updateSession(event, settings)
}

/** Sign this request's visitor in as `user`. */
export const startSession = (event, user) => writeSession(event, { user: publicUser(user) })

/** Remember that this browser is waiting for the confirmation email sent to `email`. Signs nobody in. */
export const startPending = (event, email) => writeSession(event, { pending: { email, at: Date.now() } })

export async function endSession(event) {
  await clearSession(event, { name: COOKIE_NAME, cookie: config(event, '').cookie })
}
