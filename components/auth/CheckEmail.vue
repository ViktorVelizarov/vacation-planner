<script setup>
import { Mail } from 'lucide-vue-next'
import { describeAuthError } from '~/composables/useAuth'
import { authContent } from '~/utils/auth-content'

// What sits in the card on "Check your inbox": what to do with the email, a Resend button that waits out the minute the
// server asks for between emails (counting it down on the button), and the way out when the address was wrong.
// The address and the wait come from `pending` (useAuth); resending takes no address, the server uses the one this
// browser signed up with.
const copy = authContent.check
const { pending, resend } = useAuth()

const busy = ref(false)
const status = ref('') // "Sent again." for the polite live region
const failure = ref(null) // { message, hint, action? }

// Count down against the clock, not by subtracting one a second: background tabs slow their timers down.
const until = ref(0)
const now = ref(Date.now())
// until the page is live (the server render, and the first client render that must match it) the wait is just the
// number the server sent
const seconds = computed(() => (until.value ? Math.max(0, Math.ceil((until.value - now.value) / 1000)) : pending.value?.resendIn ?? 0))
const waiting = computed(() => seconds.value > 0)

let ticker
function startWait(seconds) {
  until.value = Date.now() + seconds * 1000
  now.value = Date.now()
}
onMounted(() => {
  startWait(pending.value?.resendIn ?? 0)
  ticker = setInterval(() => { now.value = Date.now() }, 500)
})
onBeforeUnmount(() => clearInterval(ticker))

async function send() {
  if (busy.value || waiting.value) return
  busy.value = true
  status.value = ''
  failure.value = null
  try {
    const { pending: next } = await resend()
    startWait(next?.resendIn ?? 60)
    status.value = copy.sentAgain
  } catch (error) {
    const problem = describeAuthError(error)
    if (problem.retryAfter) startWait(problem.retryAfter)
    failure.value = {
      message: problem.message,
      hint: problem.hint,
      // the sign-up is gone (expired, or already confirmed): say where to go instead
      action: problem.status === 409 ? { label: copy.signInInstead, to: '/sign-in' } : problem.status === 410 ? { label: copy.startOver, to: '/sign-up' } : null,
    }
    await nextTick()
    document.getElementById('check-failure')?.focus()
  } finally {
    busy.value = false
  }
}

const label = computed(() => (busy.value ? copy.sending : waiting.value ? copy.resendIn(seconds.value) : copy.resend))
</script>

<template>
  <div class="check">
    <div class="check__what">
      <span class="check__tile"><Mail aria-hidden="true" :stroke-width="1.75" /></span>
      <div class="check__copy">
        <p>{{ copy.step }} <strong>{{ copy.stepButton }}</strong>.</p>
        <p class="check__hint">{{ copy.hint }}</p>
      </div>
    </div>

    <LandingAlert v-if="failure" id="check-failure" :hint="failure.hint">
      {{ failure.message }}
      <template v-if="failure.action" #action><NuxtLink :to="failure.action.to">{{ failure.action.label }}</NuxtLink></template>
    </LandingAlert>

    <div>
      <LandingButton class="check__resend" variant="ghost" size="lg" block :disabled="busy || waiting" @click="send">{{ label }}</LandingButton>
      <p class="check__status" role="status" aria-live="polite">{{ status }}</p>
    </div>

    <p class="check__wrong">
      {{ copy.wrongText }}
      <NuxtLink :to="copy.wrongTo">{{ copy.wrongLabel }}</NuxtLink>
    </p>
  </div>
</template>

<style scoped>
.check { display: grid; gap: 18px; }
.check__what { display: flex; align-items: flex-start; gap: 16px; }
/* the search card's field tile, one size up */
.check__tile { flex: none; display: grid; place-items: center; width: 48px; height: 48px; border-radius: var(--vp-radius); background: var(--vp-wash); color: var(--vp-blue); }
.check__tile svg { width: 24px; height: 24px; }
.check__copy { min-width: 0; display: grid; gap: 4px; }
.check__copy p { margin: 0; color: var(--vp-ink); font: 400 16px/1.5 var(--vp-font); }
.check__copy strong { font-weight: 700; }
.check__copy .check__hint { color: var(--vp-ink-2); font-size: 14.5px; }

/* a control's edge has to be visible on its own (about 3.3:1), as on the form fields */
.check__resend { border-color: color-mix(in srgb, var(--vp-ink-3) 75%, #fff); }
/* counting down is not a hover target: the disabled button keeps its resting colours */
.check__resend:disabled, .check__resend:disabled:hover { border-color: color-mix(in srgb, var(--vp-ink-3) 75%, #fff); color: var(--vp-ink); cursor: default; }
/* the live region is always in the page so "Sent again." is announced, and takes no room until it has something to say */
.check__status { margin: 12px 0 0; color: var(--vp-ink-2); font: 500 14px/1.4 var(--vp-font); text-align: center; }
.check__status:empty { margin: 0; }
.check__wrong { margin: 0; text-align: center; color: var(--vp-ink-2); font: 400 14.5px/1.4 var(--vp-font); }
.check__wrong a { padding-block: 6px; margin-block: -6px; color: var(--vp-blue-deep); font-weight: 600; text-underline-offset: 3px; }
.check__wrong a:hover { color: var(--vp-blue); }
</style>
