// The account rules, shared by the sign-in forms (instant feedback) and the server (the real check), so the two
// can never disagree about what a valid name, email or password is. Plain functions with no Node imports, so the
// browser can import this file too; it lives under server/ because Nitro cannot bundle server imports from outside it.
export const AUTH_LIMITS = { nameMax: 60, emailMax: 254, localMax: 64, passwordMin: 8, passwordMax: 128 }

// A confirmation email goes to this address, so it is held to the plain, widely accepted form: letters, digits and the
// punctuation of RFC 5322's "atext" before the @ (no spaces, commas, quotes or brackets that a mail service could read
// as more than one address), and ordinary dotted host names after it. Unicode addresses are not accepted; an
// internationalised domain can be written in its xn-- form.
const ATOM = "[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+"
const LABEL = '[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?'
const EMAIL_SHAPE = new RegExp(`^${ATOM}(?:\\.${ATOM})*@${LABEL}(?:\\.${LABEL})+$`)

/** Emails are compared case-insensitively, so they are stored and looked up lower-cased. */
export const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase()

/** One line, no control characters, single spaces. */
export const cleanName = (value) =>
  String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const emailProblem = (email) => {
  const valid =
    email &&
    email.length <= AUTH_LIMITS.emailMax &&
    email.indexOf('@') <= AUTH_LIMITS.localMax &&
    EMAIL_SHAPE.test(email) &&
    /\.[A-Za-z0-9-]{2,}$/.test(email) // the last part of the host name is at least two characters
  return valid ? '' : 'Enter a valid email address.'
}

/**
 * Check a create-account form. Returns the cleaned values and one message per bad field:
 * { ok, values: { name, email, password }, errors: { name?, email?, password? } }
 */
export function validateSignup(input) {
  const values = {
    name: cleanName(input?.name),
    email: normalizeEmail(input?.email),
    password: typeof input?.password === 'string' ? input.password : '',
  }
  const errors = {}

  if (!values.name) errors.name = 'Enter your name.'
  else if (values.name.length > AUTH_LIMITS.nameMax) errors.name = `Use ${AUTH_LIMITS.nameMax} characters or fewer.`

  const email = emailProblem(values.email)
  if (email) errors.email = email

  if (values.password.length < AUTH_LIMITS.passwordMin) errors.password = `Use at least ${AUTH_LIMITS.passwordMin} characters.`
  else if (values.password.length > AUTH_LIMITS.passwordMax) errors.password = `Use ${AUTH_LIMITS.passwordMax} characters or fewer.`

  return { ok: !Object.keys(errors).length, values, errors }
}

/** Check a sign-in form. Only shape is checked here; whether the password is right is the server's business. */
export function validateLogin(input) {
  const values = {
    email: normalizeEmail(input?.email),
    password: typeof input?.password === 'string' ? input.password : '',
  }
  const errors = {}

  const email = emailProblem(values.email)
  if (email) errors.email = email

  if (!values.password) errors.password = 'Enter your password.'
  else if (values.password.length > AUTH_LIMITS.passwordMax) errors.password = 'That password is too long.'

  return { ok: !Object.keys(errors).length, values, errors }
}

/**
 * Only follow redirects that stay on this site. Anything else (another origin, "//host", backslash tricks,
 * control characters) falls back, so ?redirect= cannot be turned into an open redirect.
 * The sign-in, sign-up and email-confirmation pages themselves are never a destination, to avoid bouncing between them.
 */
export function safeRedirect(target, fallback = '/') {
  if (typeof target !== 'string') return fallback
  if (!target.startsWith('/') || target.startsWith('//') || target.includes('\\') || /[\u0000-\u001f\u007f]/.test(target)) return fallback
  if (/^\/(sign-in|sign-up|check-email|verify-email)(?:[/?#]|$)/i.test(target)) return fallback
  return target
}
