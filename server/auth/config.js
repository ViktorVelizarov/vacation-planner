// Settings for accounts. Everything comes from environment variables, so nothing secret is in the repo and nothing
// is ever written to disk. They are all required, in development as well as on Vercel:
//
//   NUXT_SESSION_PASSWORD   32+ random characters that seal the sign-in cookie.
//   KV_REST_API_URL         Upstash Redis REST address and token: accounts, confirmation links and throttles live
//   KV_REST_API_TOKEN       there (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN work too).
//   BREVO_API_KEY           an email service for the confirmation emails: one of these two,
//   RESEND_API_KEY          plus the address they come from:
//   AUTH_EMAIL_FROM         "Vacation Planner <hello@example.com>" or just the address.
//   AUTH_BASE_URL           optional: the public address of the site, when it cannot be worked out (see mail.js).
//
// When one is missing the account endpoints answer 503 and the server log (and, in development only, the response)
// says which.

export const COOKIE_NAME = 'vp_session'

// How long things last.
export const SESSION_SECONDS = 60 * 60 * 24 * 30 // a signed-in browser stays signed in for 30 days
export const LINK_SECONDS = 60 * 60 * 24 // an emailed confirmation link works for 24 hours, once
export const UNCONFIRMED_SECONDS = 60 * 60 * 24 * 7 // an account nobody confirmed is thrown away after 7 days
export const RESEND_WAIT_SECONDS = 60 // the wait between two emails to the same address

/** Nitro replaces process.env.NODE_ENV when it builds, so this is true for any built server (Vercel previews too). */
export const isProduction = () => process.env.NODE_ENV === 'production'

/** A deployment is missing a required setting. Endpoints answer 503 and log the reason. */
export class AuthConfigError extends Error {}

/**
 * Throws one AuthConfigError that names EVERY required setting that is absent, so a machine that has none of them yet
 * learns the whole list from one try instead of one setting per restart. (A setting that is present but wrong, such as
 * a session secret that is too short, is reported by the check that uses it.) `mail: false` skips the email settings,
 * for the endpoints that never send email.
 */
export function assertConfigured({ mail = true } = {}) {
  const missing = []
  if (!process.env.NUXT_SESSION_PASSWORD) missing.push('NUXT_SESSION_PASSWORD (32 or more random characters)')
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) missing.push('KV_REST_API_URL and KV_REST_API_TOKEN (the Upstash Redis database)')
  if (mail) {
    if (!process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY) missing.push('BREVO_API_KEY or RESEND_API_KEY (the email service)')
    if (!process.env.AUTH_EMAIL_FROM) missing.push('AUTH_EMAIL_FROM (the address the confirmation emails come from)')
  }
  if (missing.length) throw new AuthConfigError(`Not set: ${missing.join('; ')}. See .env.example.`)
}

export function sessionSecret() {
  const secret = process.env.NUXT_SESSION_PASSWORD
  if (!secret) throw new AuthConfigError('NUXT_SESSION_PASSWORD is not set. Use 32 or more random characters.')
  if (secret.length < 32) throw new AuthConfigError('NUXT_SESSION_PASSWORD must be at least 32 characters.')
  return secret
}
