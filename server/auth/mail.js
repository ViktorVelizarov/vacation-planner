// Sending the confirmation email, and working out the address its link points to.
//
// The email goes out through an email service's REST API (plain fetch, nothing to install): Brevo or Resend,
// whichever has its key set. There is deliberately no "print the link in the terminal" fallback: an account is only
// real once its owner has read an email, so a deployment that cannot send one cannot sign anyone up.

import { getRequestHeader, getRequestProtocol } from 'h3'
import { AuthConfigError } from './config.js'

/** The email service failed or refused this message. Endpoints answer 502; the service's own reason is logged. */
export class MailError extends Error {}

const SEND_TIMEOUT_MS = 8000
const DEFAULT_SENDER_NAME = 'Vacation Planner'

/** "Vacation Planner <hello@example.com>" or "hello@example.com"  ->  { name, email } */
export function parseSender(value) {
  const text = String(value ?? '').trim()
  if (!text) throw new AuthConfigError('AUTH_EMAIL_FROM is not set: the address the confirmation emails come from.')
  const named = text.match(/^(.*?)\s*<([^<>\s]+@[^<>\s]+)>$/)
  const email = named ? named[2] : /^[^<>\s,;"]+@[^<>\s,;"]+$/.test(text) ? text : ''
  if (!email) throw new AuthConfigError('AUTH_EMAIL_FROM must look like "Vacation Planner <hello@example.com>" or hello@example.com.')
  const name = (named ? named[1] : '').replace(/["<>\\\r\n]/g, '').trim()
  return { name: name || DEFAULT_SENDER_NAME, email }
}

// How each service wants a message. The *_API_URL overrides exist so the tests can aim at a stand-in server.
const SERVICES = {
  brevo: {
    keyVariable: 'BREVO_API_KEY',
    url: () => process.env.BREVO_API_URL || 'https://api.brevo.com/v3/smtp/email',
    request: (key, sender, { to, subject, html, text }) => ({
      headers: { 'api-key': key, accept: 'application/json' },
      body: { sender, to: [{ email: to }], subject, htmlContent: html, textContent: text },
    }),
  },
  resend: {
    keyVariable: 'RESEND_API_KEY',
    url: () => process.env.RESEND_API_URL || 'https://api.resend.com/emails',
    request: (key, sender, { to, subject, html, text }) => ({
      headers: { Authorization: `Bearer ${key}` },
      body: { from: `${sender.name} <${sender.email}>`, to: [to], subject, html, text },
    }),
  },
}

/**
 * The email sender for this deployment: { service, send({ to, subject, html, text }) }.
 * Throws AuthConfigError (a 503 for the visitor) when no service or no sender address is configured.
 */
export function getMailer({ fetchImpl = fetch } = {}) {
  const service = Object.keys(SERVICES).find((name) => process.env[SERVICES[name].keyVariable])
  if (!service) throw new AuthConfigError('No email service: set BREVO_API_KEY (Brevo) or RESEND_API_KEY (Resend), plus AUTH_EMAIL_FROM.')
  const sender = parseSender(process.env.AUTH_EMAIL_FROM)
  const { keyVariable, url, request } = SERVICES[service]

  return {
    service,
    async send(message) {
      const { headers, body } = request(process.env[keyVariable], sender, message)
      let response
      try {
        response = await fetchImpl(url(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
        })
      } catch (error) {
        throw new MailError(`${service} could not be reached: ${error?.message ?? error}`)
      }
      if (response.ok) return
      const detail = (await response.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300)
      if (response.status === 401 || response.status === 403) {
        throw new AuthConfigError(`${service} refused ${keyVariable} (HTTP ${response.status}). ${detail}`.trim())
      }
      throw new MailError(`${service} answered HTTP ${response.status}. ${detail}`.trim())
    },
  }
}

const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]'])

const originOf = (value, label) => {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('not http(s)')
    return url.origin
  } catch {
    throw new AuthConfigError(`${label} must be a web address such as https://planner.example.com.`)
  }
}

/**
 * The address the emailed link points to. It is never taken from the request's Host header: anyone can post a
 * sign-up with a made-up Host, and the email would then carry a working confirmation link to their own site.
 *   AUTH_BASE_URL   the site's public address, when you want to say it yourself (a custom domain, other hosting)
 *   on Vercel       the production domain for production, the deployment's own address for a preview
 *   on this machine the address the page was opened on, but only when that is localhost
 */
export function siteOrigin(event) {
  const explicit = process.env.AUTH_BASE_URL?.trim()
  if (explicit) return originOf(explicit, 'AUTH_BASE_URL')

  if (process.env.VERCEL) {
    const host = process.env.VERCEL_ENV === 'production' ? process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL : process.env.VERCEL_URL
    if (host) return originOf(`https://${host}`, 'VERCEL_URL')
  }

  const host = String(getRequestHeader(event, 'host') ?? '') // read directly: h3's getRequestHost answers "localhost" when there is none
  if (LOOPBACK.has(host.replace(/:\d+$/, '').toLowerCase())) return `${getRequestProtocol(event)}://${host}`
  throw new AuthConfigError('The site address for the confirmation link is unknown: set AUTH_BASE_URL (for example https://planner.example.com).')
}
