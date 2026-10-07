<script setup>
import { describeAuthError } from '~/composables/useAuth'
import { authContent } from '~/utils/auth-content'

// The card on "Confirm your email": one button. Pressing it uses the emailed link up, confirms the account, signs this
// browser in and opens the trip form. Opening the link never does that by itself (mail programs and security scanners
// open links to check them), which is why there is a button at all.
//   token  the secret from the link
// Emits `gone` when the link turns out to be used up or too old, so the page can say so.
const props = defineProps({
  token: { type: String, required: true },
})
const emit = defineEmits(['gone'])

const copy = authContent.confirm
const { confirm, refresh } = useAuth()

const busy = ref(false)
const failure = ref('')
const hint = ref('')

async function press() {
  if (busy.value) return
  busy.value = true
  failure.value = ''
  hint.value = ''
  try {
    await confirm(props.token)
    await navigateTo(DEMO_ROUTE, { replace: true })
  } catch (error) {
    const problem = describeAuthError(error)
    if (problem.status === 410) {
      await refresh() // another tab may have used the link and signed this browser in: say "already confirmed", not "expired"
      return emit('gone')
    }
    failure.value = authContent.failures[problem.status] ?? problem.message
    hint.value = problem.hint
    await nextTick()
    document.getElementById('confirm-failure')?.focus()
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="confirm">
    <AuthAlert v-if="failure" id="confirm-failure" :hint="hint">{{ failure }}</AuthAlert>
    <LandingButton size="lg" arrow block :disabled="busy" @click="press">{{ busy ? copy.busy : copy.submit }}</LandingButton>
    <p class="confirm__note">{{ copy.notYou }}</p>
  </div>
</template>

<style scoped>
.confirm { display: grid; gap: 18px; }
.confirm__note { margin: 0; text-align: center; color: var(--vp-ink-2); font: 400 14.5px/1.4 var(--vp-font); }
</style>
