// Request guards and the handler wrapper shared by the /api/auth/* endpoints.

import { createHash } from 'node:crypto'
import { createError, defineEventHandler, getRequestHeader, getRequestHost, getRequestIP, readBody, setResponseHeader } from 'h3'
import { AuthConfigError, isProduction } from './config.js'
import { MailError } from './mail.js'

/** Auth responses are personal: never cache them. */
export const noStore = (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  setResponseHeader(event, 'Vary', 'Cookie')
}

/**
 * Refuse state-changing requests that a browser reports as coming from another site. SameSite=Lax on the cookie is
 * the first line of defence; this closes the "log someone into the attacker's account" gap as well.
 */
export function assertSameOrigin(event) {
  const fetchSite = getRequestHeader(event, 'sec-fetch-site')
  if (fetchSite) {
    if (fetchSite === 'same-origin' || fetchSite === 'none') return
  } else {
    const origin = getRequestHeader(event, 'origin')
    if (!origin) return // not a browser (curl, server-side call)
    try {
      if (new URL(origin).host === getRequestHost(event, { xForwardedHost: true })) return
    } catch {
      // malformed Origin: fall through and refuse
    }
  }
  throw createError({ statusCode: 403, statusMessage: 'Cross-site request blocked.' })
}

/** The JSON body of a form post, kept small (a sign-in form is a few hundred bytes). */
export async function readJson(event) {
  if (Number(getRequestHeader(event, 'content-length') ?? 0) > 10_000) {
    throw createError({ statusCode: 413, statusMessage: 'Request too large.' })
  }
  try {
    const body = await readBody(event)
    return body && typeof body === 'object' ? body : {}
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Send the form as JSON.' })
  }
}

/** Behind Vercel the platform sets X-Forwarded-For; anywhere else that header is client-controlled, so ignore it. */
export const clientIp = (event) => getRequestIP(event, { xForwardedFor: Boolean(process.env.VERCEL) }) || 'unknown'

const fingerprint = (value) => createHash('sha256').update(value).digest('hex').slice(0, 24)
export const rateKeys = {
  loginByEmail: (ip, email) => `login:${ip}:${fingerprint(email)}`,
  loginByIp: (ip) => `login:${ip}`,
  signupByIp: (ip) => `signup:${ip}`,
  mailByEmail: (email) => `mail:${fingerprint(email)}`, // confirmation emails sent to one address
  badLinkByIp: (ip) => `badlink:${ip}`, // confirmation links that did not work
}

/** Throw 429 when any of these counters is already at its limit. rules: [{ key, max }] */
export async function assertUnderLimit(store, rules) {
  for (const { key, max } of rules) {
    if ((await store.rateCount(key)) >= max) {
      throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Wait a few minutes and try again.' })
    }
  }
}

/**
 * Turn anything thrown inside an endpoint into a clean HTTP error without leaking internals. The real reason goes to
 * the server log; on a developer's machine it also travels in `data.hint`, so the form can say which setting is missing.
 * (A built server, which includes every Vercel deployment, never sends it.)
 */
function toHttpError(error) {
  if (error?.statusCode) return error
  const data = isProduction() ? undefined : { hint: String(error?.message ?? error).slice(0, 300) }
  if (error instanceof AuthConfigError) {
    console.error('[auth] not configured:', error.message)
    return createError({ statusCode: 503, statusMessage: 'Accounts are not available right now.', data })
  }
  if (error instanceof MailError) {
    console.error('[auth] confirmation email not sent:', error.message)
    return createError({ statusCode: 502, statusMessage: "We couldn't send the confirmation email. Try again in a few minutes.", data })
  }
  console.error('[auth] unexpected error:', error?.message ?? error)
  return createError({ statusCode: 500, statusMessage: 'Something went wrong. Try again.', data })
}

export const defineAuthHandler = (handler) =>
  defineEventHandler(async (event) => {
    noStore(event)
    try {
      return await handler(event)
    } catch (error) {
      throw toHttpError(error)
    }
  })
