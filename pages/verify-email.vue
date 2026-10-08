<script setup>
import { describeAuthError } from '~/composables/useAuth'
import { authContent } from '~/utils/auth-content'
import { DEMO_ROUTE } from '~/utils/landing-content'

// Where the link in the confirmation email lands. Opening it only looks (the address it is for is shown, nothing is
// confirmed); pressing the button is what confirms, signs in and opens the trip form. A link that was used, or is
// older than 24 hours, says so and points at signing in for a new one.
definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: 'Confirm your email — Vacation Planner',
  description: 'Confirm your email address to finish creating your Vacation Planner account.',
  robots: 'noindex',
})
// the address carries a secret: keep it out of Referer headers and shared caches
useHead({ meta: [{ name: 'referrer', content: 'no-referrer' }] })
if (import.meta.server) useRequestEvent()?.node.res.setHeader('Cache-Control', 'no-store')

const route = useRoute()
const { loggedIn } = useAuth()
const token = computed(() => String((Array.isArray(route.query.token) ? route.query.token[0] : route.query.token) ?? ''))

// Look at the link without using it up: the address it is for, or that it no longer works.
const { data: link } = await useAsyncData(
  `verify-link:${token.value}`,
  async () => {
    if (!token.value) return { gone: true }
    try {
      return { email: (await $fetch('/api/auth/verify', { query: { token: token.value } })).email }
    } catch (error) {
      return describeAuthError(error).status === 410 ? { gone: true } : { email: '' } // some other trouble: the button still tries
    }
  },
  { watch: [token] },
)
const usedUp = ref(false) // set when pressing the button finds the link used up after all
const gone = computed(() => usedUp.value || Boolean(link.value?.gone))
const copy = computed(() => (loggedIn.value ? authContent.already : authContent.gone))
</script>

<template>
  <AuthShell v-if="gone" :title="copy.title" :lead="copy.lead">
    <LandingCard>
      <div class="gone">
        <LandingButton :to="loggedIn ? DEMO_ROUTE : '/sign-in'" size="lg" arrow block>{{ copy.submit }}</LandingButton>
        <div v-if="!loggedIn" class="gone__help">
          <p>{{ authContent.gone.note }}</p>
          <p>
            {{ authContent.gone.switchText }}
            <NuxtLink :to="authContent.gone.switchTo">{{ authContent.gone.switchLabel }}</NuxtLink>
          </p>
        </div>
      </div>
    </LandingCard>
  </AuthShell>

  <AuthShell v-else :title="authContent.confirm.title">
    <template #lead>
      <template v-if="link?.email">{{ authContent.confirm.lead }} <strong class="address">{{ link.email }}</strong></template>
      <template v-else>{{ authContent.confirm.leadWithoutAddress }}</template>
    </template>
    <LandingCard>
      <AuthConfirm :token="token" @gone="usedUp = true" />
    </LandingCard>
  </AuthShell>
</template>

<style scoped>
.address { display: inline-block; max-width: 100%; color: var(--vp-ink); font-weight: 700; overflow-wrap: anywhere; vertical-align: bottom; }
.gone { display: grid; gap: 18px; }
.gone__help { display: grid; gap: 6px; text-align: center; color: var(--vp-ink-2); font: 400 14.5px/1.4 var(--vp-font); }
.gone__help p { margin: 0; }
.gone__help a { padding-block: 6px; margin-block: -6px; color: var(--vp-blue-deep); font-weight: 600; text-underline-offset: 3px; }
.gone__help a:hover { color: var(--vp-blue); }
</style>
