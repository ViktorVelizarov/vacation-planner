<script setup>
import { describeAuthError } from '~/composables/useAuth'
import { safeRedirect, validateLogin, validateSignup } from '~~/server/auth/rules.js'
import { authContent } from '~/utils/auth-content'

// The sign-in and create-account form. The checks are the same ones the server runs (server/auth/rules.js), so a
// mistake is caught on the spot and the server only has the last word. Creating an account does not sign anybody in:
// the address has to be confirmed first, so it goes on to "Check your inbox" (so does signing in to an account whose
// address was never confirmed). Signing in to a confirmed account goes where the visitor was headed (?redirect=),
// which is the trip form when they came from "Try a demo".
//   mode  'signin' | 'signup'
const props = defineProps({
  mode: { type: String, required: true, validator: (v) => ['signin', 'signup'].includes(v) },
})

const route = useRoute()
const { signIn, signUp } = useAuth()

const isSignUp = computed(() => props.mode === 'signup')
const copy = computed(() => authContent[props.mode])
const idOf = (field) => `${props.mode}-${field}`

const form = reactive({ name: '', email: '', password: '' })
const errors = reactive({ name: '', email: '', password: '' })
const failure = ref('')
const hint = ref('') // developer-only: which setting is missing (the server sends it from a development machine only)
const busy = ref(false)

const redirectParam = computed(() => (Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect))
const signInLink = computed(() => ({ path: '/sign-in', query: redirectParam.value ? { redirect: redirectParam.value } : {} }))
const switchLink = computed(() => ({ path: copy.value.switchTo, query: redirectParam.value ? { redirect: redirectParam.value } : {} }))
const emailTaken = computed(() => isSignUp.value && errors.email === authContent.failures[409])

async function focusFirstProblem() {
  await nextTick()
  const field = ['name', 'email', 'password'].find((key) => errors[key])
  if (field) document.getElementById(idOf(field))?.focus()
  else document.getElementById(`${props.mode}-failure`)?.focus()
}

async function submit() {
  if (busy.value) return
  failure.value = ''
  hint.value = ''
  const checked = isSignUp.value ? validateSignup(form) : validateLogin(form)
  Object.assign(errors, { name: '', email: '', password: '' }, checked.errors)
  if (!checked.ok) return focusFirstProblem()

  busy.value = true
  try {
    const result = await (isSignUp.value ? signUp(checked.values) : signIn(checked.values))
    await navigateTo(result.pending ? '/check-email' : safeRedirect(redirectParam.value, DEMO_ROUTE), { replace: true })
  } catch (error) {
    const problem = describeAuthError(error)
    const message = authContent.failures[problem.status] ?? problem.message
    if (problem.field && problem.field in errors) errors[problem.field] = message
    else {
      failure.value = message
      hint.value = problem.hint
    }
    await focusFirstProblem()
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <form class="form" novalidate :aria-busy="busy" @submit.prevent="submit">
    <AuthAlert v-if="failure" :id="`${mode}-failure`" :hint="hint">{{ failure }}</AuthAlert>

    <AuthField
      v-if="isSignUp"
      :id="idOf('name')"
      v-model="form.name"
      :label="authContent.fields.name"
      autocomplete="name"
      :error="errors.name"
    />
    <AuthField
      :id="idOf('email')"
      v-model="form.email"
      type="email"
      :label="authContent.fields.email"
      :autocomplete="isSignUp ? 'email' : 'username'"
      placeholder="name@example.com"
      :error="errors.email"
    >
      <template #action>
        <NuxtLink v-if="emailTaken" class="form__link" :to="signInLink">{{ authContent.emailTakenAction }}</NuxtLink>
      </template>
    </AuthField>
    <AuthField
      :id="idOf('password')"
      v-model="form.password"
      type="password"
      :label="authContent.fields.password"
      :autocomplete="isSignUp ? 'new-password' : 'current-password'"
      :hint="isSignUp ? authContent.fields.passwordHint : ''"
      :error="errors.password"
      :show-label="authContent.fields.showPassword"
      :hide-label="authContent.fields.hidePassword"
    />

    <LandingButton type="submit" size="lg" arrow block :disabled="busy">{{ busy ? copy.busy : copy.submit }}</LandingButton>

    <p class="form__switch">
      {{ copy.switchText }}
      <NuxtLink class="form__link" :to="switchLink">{{ copy.switchLabel }}</NuxtLink>
    </p>
  </form>
</template>

<style scoped>
.form { display: grid; gap: 18px; }
.form .btn { margin-top: 6px; }
.form__switch { margin: 0; text-align: center; color: var(--vp-ink-2); font: 400 14.5px/1.4 var(--vp-font); }
.form__link { padding-block: 6px; margin-block: -6px; color: var(--vp-blue-deep); font-weight: 600; text-underline-offset: 3px; }
.form__link:hover { color: var(--vp-blue); }
</style>
