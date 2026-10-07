// The words on the account pages (sign in, create account, check your inbox, confirm your email), in one place; the
// landing page's own copy is in landing-content.js. Server messages for field problems (a bad email, a taken email)
// come from server/auth/rules.js and the API; the sentences below are the ones the pages add or choose by the kind
// of failure.

export const authContent = {
  back: 'Back to home',
  backShort: 'Home', // shown instead of `back` on the narrowest phones
  tabsLabel: 'Account',

  signin: {
    title: 'Welcome back',
    lead: 'Sign in to open the trip form.',
    submit: 'Sign in',
    busy: 'Signing in…',
    switchText: 'New here?',
    switchLabel: 'Create an account',
    switchTo: '/sign-up',
  },

  signup: {
    title: 'Create your account',
    lead: 'Free, and it takes a minute.',
    submit: 'Create account',
    busy: 'Creating account…',
    switchText: 'Already have an account?',
    switchLabel: 'Sign in',
    switchTo: '/sign-in',
  },

  tabs: { signin: 'Sign in', signup: 'Create account' },

  fields: {
    name: 'Your name',
    email: 'Email',
    password: 'Password',
    passwordHint: 'At least 8 characters.',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },

  // Chosen by HTTP status when the server refuses a sign-in or sign-up; each names the problem and the way out.
  // Statuses not listed (429 too many tries, 502 the email would not send) already arrive from the server in plain words.
  failures: {
    401: 'Incorrect email or password. Check both and try again.',
    403: 'That request was blocked. Reload the page and try again.',
    409: 'An account with this email already exists.',
    503: 'Accounts are not available right now. Try again in a few minutes.',
  },
  emailTakenAction: 'Sign in instead',

  // "Check your inbox": shown right after creating an account, or after signing in to one that is not confirmed yet.
  check: {
    title: 'Check your inbox',
    lead: 'We sent a confirmation link to',
    step: 'Open the email and press',
    stepButton: 'Confirm email',
    hint: "Can't find it? Look in your spam folder.",
    resend: 'Resend email',
    resendIn: (seconds) => `Resend in ${seconds}s`,
    sending: 'Sending…',
    sentAgain: 'Sent again. It can take a minute to arrive.',
    wrongText: 'Wrong address?',
    wrongLabel: 'Start again',
    wrongTo: '/sign-up',
    signInInstead: 'Sign in',
    startOver: 'Create the account again',
  },

  // "Confirm your email": where the link in the email lands. One press confirms, signs in and opens the trip form.
  confirm: {
    title: 'Confirm your email',
    lead: "You're confirming",
    leadWithoutAddress: 'Press the button to finish creating your account.',
    submit: 'Confirm email',
    busy: 'Confirming…',
    notYou: "Didn't create an account? You can close this page.",
  },

  // The link was used, or is older than 24 hours. Which it is, and what signing in does next, depends on the account:
  // a confirmed one just signs in, an unconfirmed one is sent a new link, and one nobody confirmed within 7 days is
  // gone (signing in says "Incorrect email or password"), so the page names that case and points at creating it again.
  gone: {
    title: 'This link no longer works',
    lead: 'A link works once and expires after 24 hours.',
    submit: 'Sign in',
    note: "Haven't confirmed yet? Signing in sends a new link.",
    switchText: 'New here, or signed up over a week ago?',
    switchLabel: 'Create an account',
    switchTo: '/sign-up',
  },
  // ...the same, for a visitor who is already signed in on this device (the usual reason: the link was pressed twice).
  // It cannot tell whether that account is the link's own, so it claims nothing about confirmation.
  already: {
    title: 'This link no longer works',
    lead: "A link works once and expires after 24 hours. You're signed in on this device, so you can carry on.",
    submit: 'Open the trip form',
  },

  // The photograph beside the form and its caption (marginalia, like the coordinates on the destination cards).
  art: { place: 'Lisbon', coords: '38.72° N 9.14° W' },
}
