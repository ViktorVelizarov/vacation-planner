// Who is signed in, for any page or component:
//   const { user, loggedIn, pending, signIn, signUp, resend, confirm, signOut } = useAuth()
//
// An account is only real once its email address is confirmed, so creating one (or signing in to one that was never
// confirmed) does not sign anybody in: it leaves `pending` set ({ email, resendIn }), which is what the "Check your
// inbox" page shows. Pressing the button on the emailed link (`confirm`) then confirms the account and signs in.
//
// The state is read once on the server for the first page view (so the nav is right in the HTML and does not
// flicker), then kept in sync here after each call. The session itself is an HttpOnly cookie that the browser sends
// by itself; nothing about it is readable from script.

export function useAuth() {
  const user = useState('auth:user', () => null)
  const pending = useState('auth:pending', () => null) // { email, resendIn } while an account waits for its email link
  const ready = useState('auth:ready', () => false) // has /api/auth/me been asked yet?
  const requestFetch = useRequestFetch() // on the server, forwards the visitor's cookies to our own API

  const loggedIn = computed(() => Boolean(user.value))

  async function refresh() {
    try {
      const me = await requestFetch('/api/auth/me')
      user.value = me?.user ?? null
      pending.value = me?.pending ?? null
    } catch {
      user.value = null
      pending.value = null
    }
    ready.value = true
    return user.value
  }

  // every call that can sign in or start waiting answers { user } or { pending }
  const adopt = (response) => {
    user.value = response.user ?? null
    pending.value = response.pending ?? null
    ready.value = true
    return response
  }

  const signIn = ({ email, password }) => $fetch('/api/auth/login', { method: 'POST', body: { email, password } }).then(adopt)
  const signUp = ({ name, email, password }) => $fetch('/api/auth/signup', { method: 'POST', body: { name, email, password } }).then(adopt)

  /** Email the confirmation link again to the address in `pending`. */
  const resend = () => $fetch('/api/auth/resend', { method: 'POST' }).then(adopt)

  /** Use the emailed link up: confirms the account and signs this browser in. */
  const confirm = (token) => $fetch('/api/auth/verify', { method: 'POST', body: { token } }).then(adopt)

  async function signOut() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      pending.value = null
    }
  }

  return { user, loggedIn, pending, ready, refresh, signIn, signUp, resend, confirm, signOut }
}

/**
 * Turn whatever a failed account call threw into something a page can show:
 * { status, message, field, hint, retryAfter } where `field` names the input the server blames (or null), `hint` is
 * the developer-only note about a missing setting (empty in production) and `retryAfter` is the seconds to wait (or 0).
 */
export function describeAuthError(error) {
  const status = error?.statusCode ?? error?.status ?? 0
  const body = error?.data ?? {}
  if (!status) return { status: 0, field: null, hint: '', retryAfter: 0, message: "Can't reach the server. Check your connection and try again." }
  return {
    status,
    field: body.data?.field ?? null,
    hint: body.data?.hint ?? '',
    retryAfter: Number(body.data?.retryAfter) || 0,
    message: body.statusMessage || error?.statusMessage || 'Something went wrong. Try again.',
  }
}
